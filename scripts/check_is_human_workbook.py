#!/usr/bin/env python3

import argparse
from concurrent.futures import ThreadPoolExecutor, as_completed
import json
import os
import re
import urllib.request
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET


MAIN_NS = "http://schemas.openxmlformats.org/spreadsheetml/2006/main"
OFFICE_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
NS = {"a": MAIN_NS}

ET.register_namespace("", MAIN_NS)
ET.register_namespace("r", OFFICE_NS)

IS_HUMAN_SELECTOR = "f72c436f"
CHAIN_CONFIG = {
    "ethereum": {
        "chain_id": 1,
        "env_key": "MAINNET_RPC",
        "contract_address": "0xbE9834097A4E97689d9B667441acafb456D0480A",
        "contract_name": "ProofOfHumanity",
    },
    "gnosis": {
        "chain_id": 100,
        "env_key": "GNOSIS_RPC",
        "contract_address": "0x16044E1063C08670f8653055A786b7CC2034d2b0",
        "contract_name": "CrossChainProofOfHumanity",
    },
}
ADDRESS_PATTERN = re.compile(r"^0x[a-fA-F0-9]{40}$")


def load_env_file(path: Path) -> None:
    if not path.exists():
        return

    for raw_line in path.read_text().splitlines():
        line = raw_line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip().strip("'").strip('"')

        if key and key not in os.environ:
            os.environ[key] = value


def get_cell_value(cell: ET.Element) -> str | None:
    inline = cell.find("a:is", NS)
    if inline is not None:
        text_parts = []
        for text_node in inline.findall(".//a:t", NS):
            text_parts.append(text_node.text or "")
        return "".join(text_parts)

    value = cell.find("a:v", NS)
    if value is not None:
        return value.text

    formula = cell.find("a:f", NS)
    if formula is not None:
        return formula.text

    return None


def column_to_index(column: str) -> int:
    index = 0
    for char in column:
        index = index * 26 + (ord(char.upper()) - 64)
    return index


def index_to_column(index: int) -> str:
    chars = []
    while index > 0:
        index, remainder = divmod(index - 1, 26)
        chars.append(chr(65 + remainder))
    return "".join(reversed(chars))


def get_cell_column(cell_ref: str) -> str:
    match = re.match(r"([A-Z]+)", cell_ref)
    if not match:
        raise ValueError(f"Invalid cell reference: {cell_ref}")
    return match.group(1)


def get_or_create_sheet_data(root: ET.Element) -> ET.Element:
    sheet_data = root.find("a:sheetData", NS)
    if sheet_data is None:
        raise ValueError("Missing sheetData in worksheet")
    return sheet_data


def set_inline_string_cell(row: ET.Element, cell_ref: str, value: str) -> None:
    existing = row.find(f"a:c[@r='{cell_ref}']", NS)
    if existing is not None:
        row.remove(existing)

    cell = ET.Element(f"{{{MAIN_NS}}}c", {"r": cell_ref, "t": "inlineStr"})
    is_node = ET.SubElement(cell, f"{{{MAIN_NS}}}is")
    text_node = ET.SubElement(is_node, f"{{{MAIN_NS}}}t")
    text_node.text = value
    insert_cell_sorted(row, cell)


def set_boolean_cell(row: ET.Element, cell_ref: str, value: bool) -> None:
    existing = row.find(f"a:c[@r='{cell_ref}']", NS)
    if existing is not None:
        row.remove(existing)

    cell = ET.Element(f"{{{MAIN_NS}}}c", {"r": cell_ref, "t": "b"})
    value_node = ET.SubElement(cell, f"{{{MAIN_NS}}}v")
    value_node.text = "1" if value else "0"
    insert_cell_sorted(row, cell)


def insert_cell_sorted(row: ET.Element, new_cell: ET.Element) -> None:
    new_index = column_to_index(get_cell_column(new_cell.attrib["r"]))
    children = list(row)
    insert_at = len(children)

    for idx, cell in enumerate(children):
        current_index = column_to_index(get_cell_column(cell.attrib["r"]))
        if current_index > new_index:
            insert_at = idx
            break

    row.insert(insert_at, new_cell)


def encode_is_human_call(address: str) -> str:
    normalized = address.lower()
    if not ADDRESS_PATTERN.match(normalized):
        raise ValueError(f"Invalid address: {address}")

    encoded_address = normalized[2:].rjust(64, "0")
    return f"0x{IS_HUMAN_SELECTOR}{encoded_address}"


def rpc_call(rpc_url: str, method: str, params: list) -> dict:
    payload = json.dumps(
        {
            "jsonrpc": "2.0",
            "id": 1,
            "method": method,
            "params": params,
        }
    ).encode()

    request = urllib.request.Request(
        rpc_url,
        data=payload,
        headers={"Content-Type": "application/json"},
    )

    with urllib.request.urlopen(request, timeout=30) as response:
        return json.loads(response.read().decode())


def is_human(rpc_url: str, contract_address: str, address: str) -> bool:
    response = rpc_call(
        rpc_url,
        "eth_call",
        [{"to": contract_address, "data": encode_is_human_call(address)}, "latest"],
    )

    if "error" in response:
        raise ValueError(
            f"RPC error while checking {address}: {response['error'].get('message', response['error'])}"
        )

    result = response.get("result")
    if not isinstance(result, str) or not result.startswith("0x"):
        raise ValueError(f"Unexpected RPC result for {address}: {result}")

    return int(result, 16) == 1


def read_sheet_rows(sheet_data: ET.Element) -> list[ET.Element]:
    return sheet_data.findall("a:row", NS)


def update_dimension(root: ET.Element, max_column: str, max_row: int) -> None:
    dimension = root.find("a:dimension", NS)
    if dimension is None:
        dimension = ET.Element(f"{{{MAIN_NS}}}dimension")
        root.insert(0, dimension)
    dimension.set("ref", f"A1:{max_column}{max_row}")


def get_row_inputs(rows: list[ET.Element]) -> list[dict]:
    row_inputs = []
    for row in rows[1:]:
        row_number = row.attrib.get("r")
        if row_number is None:
            raise ValueError("Row without index found")

        values_by_column = {}
        for cell in row.findall("a:c", NS):
            values_by_column[get_cell_column(cell.attrib["r"])] = get_cell_value(cell)

        address = values_by_column.get("B")
        chain = values_by_column.get("C")

        if address is None and chain is None:
            continue

        if not address or not chain:
            raise ValueError(f"Missing address or chain in row {row_number}")

        if chain.strip().lower() not in CHAIN_CONFIG:
            raise ValueError(f"Unsupported chain '{chain}' in row {row_number}")

        row_inputs.append(
            {
                "row_number": row_number,
                "address": address,
                "chain": chain.strip().lower(),
            }
        )

    return row_inputs


def get_checks_for_row(row_input: dict, mode: str) -> list[str]:
    if mode == "both-chains":
        return ["ethereum", "gnosis"]

    return [row_input["chain"]]


def get_contract_label(chain_key: str) -> str:
    config = CHAIN_CONFIG[chain_key]
    return f"{config['contract_name']} ({config['chain_id']})"


def run_checks(row_inputs: list[dict], mode: str, workers: int) -> dict[str, dict[str, bool]]:
    tasks = []
    for row_input in row_inputs:
        for chain_key in get_checks_for_row(row_input, mode):
            tasks.append(
                {
                    "row_number": row_input["row_number"],
                    "address": row_input["address"],
                    "chain_key": chain_key,
                }
            )

    results: dict[str, dict[str, bool]] = {}
    with ThreadPoolExecutor(max_workers=workers) as executor:
        future_map = {}
        for task in tasks:
            config = CHAIN_CONFIG[task["chain_key"]]
            rpc_url = os.environ.get(config["env_key"])
            if not rpc_url:
                raise ValueError(f"Missing RPC URL for {config['env_key']}")

            future = executor.submit(
                is_human,
                rpc_url,
                config["contract_address"],
                task["address"],
            )
            future_map[future] = task

        for future in as_completed(future_map):
            task = future_map[future]
            human = future.result()
            row_results = results.setdefault(task["row_number"], {})
            row_results[task["chain_key"]] = human
            print(
                f"row {task['row_number']}: {task['address']} on {task['chain_key']} -> is_human={str(human).lower()}",
                flush=True,
            )

    return results


def write_row_chain_columns(
    rows: list[ET.Element],
    row_inputs: list[dict],
    results: dict[str, dict[str, bool]],
) -> str:
    result_column = "E"
    contract_column = "F"

    header_row = rows[0]
    set_inline_string_cell(header_row, f"{result_column}1", "is_human")
    set_inline_string_cell(header_row, f"{contract_column}1", "checked_contract")

    row_map = {row.attrib["r"]: row for row in rows[1:] if "r" in row.attrib}
    for row_input in row_inputs:
        row_number = row_input["row_number"]
        chain_key = row_input["chain"]
        row = row_map[row_number]
        human = results[row_number][chain_key]

        set_boolean_cell(row, f"{result_column}{row_number}", human)
        set_inline_string_cell(
            row,
            f"{contract_column}{row_number}",
            get_contract_label(chain_key),
        )

    return contract_column


def write_both_chain_columns(
    rows: list[ET.Element],
    row_inputs: list[dict],
    results: dict[str, dict[str, bool]],
) -> str:
    header_row = rows[0]
    columns = {
        "ethereum": ("E", "F"),
        "gnosis": ("G", "H"),
    }

    set_inline_string_cell(header_row, "E1", "is_human_ethereum")
    set_inline_string_cell(header_row, "F1", "checked_contract_ethereum")
    set_inline_string_cell(header_row, "G1", "is_human_gnosis")
    set_inline_string_cell(header_row, "H1", "checked_contract_gnosis")

    row_map = {row.attrib["r"]: row for row in rows[1:] if "r" in row.attrib}
    for row_input in row_inputs:
        row_number = row_input["row_number"]
        row = row_map[row_number]

        for chain_key, (result_column, contract_column) in columns.items():
            human = results[row_number][chain_key]
            set_boolean_cell(row, f"{result_column}{row_number}", human)
            set_inline_string_cell(
                row,
                f"{contract_column}{row_number}",
                get_contract_label(chain_key),
            )

    return "H"


def append_or_replace_result_columns(root: ET.Element, mode: str, workers: int) -> str:
    sheet_data = get_or_create_sheet_data(root)
    rows = read_sheet_rows(sheet_data)
    if not rows:
        raise ValueError("Workbook sheet has no rows")

    row_inputs = get_row_inputs(rows)
    results = run_checks(row_inputs, mode, workers)

    if mode == "both-chains":
        max_column = write_both_chain_columns(rows, row_inputs, results)
    else:
        max_column = write_row_chain_columns(rows, row_inputs, results)

    update_dimension(root, max_column, len(rows))
    return max_column


def write_workbook(input_path: Path, output_path: Path, mode: str, workers: int) -> None:
    with zipfile.ZipFile(input_path, "r") as input_zip:
        files = {name: input_zip.read(name) for name in input_zip.namelist()}

    sheet_path = "xl/worksheets/sheet1.xml"
    if sheet_path not in files:
        raise ValueError("Expected xl/worksheets/sheet1.xml in workbook")

    worksheet_root = ET.fromstring(files[sheet_path])
    append_or_replace_result_columns(worksheet_root, mode, workers)
    files[sheet_path] = ET.tostring(worksheet_root, encoding="utf-8", xml_declaration=True)

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(output_path, "w", compression=zipfile.ZIP_DEFLATED) as output_zip:
        for name, content in files.items():
            output_zip.writestr(name, content)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default="output/poh_all_active_profiles_eth_gnosis.xlsx",
        help="Input XLSX workbook path",
    )
    parser.add_argument(
        "--output",
        default="output/poh_all_active_profiles_eth_gnosis_is_human.xlsx",
        help="Output XLSX workbook path",
    )
    parser.add_argument(
        "--mode",
        choices=["row-chain", "both-chains"],
        default="row-chain",
        help="Check only the row chain or check both Ethereum and Gnosis for every row",
    )
    parser.add_argument(
        "--workers",
        type=int,
        default=16,
        help="Number of parallel RPC calls",
    )
    return parser.parse_args()


def main() -> int:
    load_env_file(Path(".env"))
    load_env_file(Path(".env.local"))

    args = parse_args()
    input_path = Path(args.input)
    output_path = Path(args.output)

    if not input_path.exists():
        raise ValueError(f"Input file not found: {input_path}")

    if args.workers < 1:
        raise ValueError("--workers must be at least 1")

    write_workbook(input_path, output_path, args.mode, args.workers)
    print(f"Wrote {output_path}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
