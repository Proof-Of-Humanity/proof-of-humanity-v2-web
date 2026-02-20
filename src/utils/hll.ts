import { createHash } from "node:crypto";

// Use 2^10 registers (1024) for ~3.25% std error.
export const HLL_PRECISION = 10;
export const HLL_REGISTERS = 1 << HLL_PRECISION;
const TWO_POW_32 = Math.pow(2, 32);

// HyperLogLog bias-correction constants from:
// Flajolet et al., "HyperLogLog: the analysis of a near-optimal cardinality estimation algorithm" (2007).
// Source: https://algo.inria.fr/flajolet/Publications/FlFuGaMe07.pdf page 14 Fig 3
const HLL_ALPHA_NUMERATOR = 0.7213;
const HLL_ALPHA_DENOMINATOR_COEFF = 1.079;
const HLL_SMALL_RANGE_THRESHOLD_MULTIPLIER = 5 / 2;
const HLL_LARGE_RANGE_THRESHOLD_DIVISOR = 30;

export type HllSketch = {
  precision: number;
  registers: number[];
};

const alphaForRegisterCount = (registerCount: number) => {
  return HLL_ALPHA_NUMERATOR / (1.0 + HLL_ALPHA_DENOMINATOR_COEFF / registerCount);
};

const hashTo64Bits = (value: string): bigint => {
  const digest = createHash("sha256").update(value).digest("hex");
  return BigInt(`0x${digest.slice(0, 16)}`);
};

const countLeadingZeros = (value: bigint, bitLength: number): number => {
  for (let i = bitLength - 1; i >= 0; i -= 1) {
    if (((value >> BigInt(i)) & 1n) === 1n) {
      return bitLength - 1 - i;
    }
  }

  return bitLength;
};

const normalizeSketch = (value: unknown): HllSketch => {
  if (value && typeof value === "object") {
    const candidateSketch = value as HllSketch;
    if (
      candidateSketch.precision === HLL_PRECISION &&
      Array.isArray(candidateSketch.registers) &&
      candidateSketch.registers.length === HLL_REGISTERS
    ) {
      return {
        precision: HLL_PRECISION,
        registers: candidateSketch.registers.map((v) => Number(v) || 0),
      };
    }
  }

  return {
    precision: HLL_PRECISION,
    registers: Array.from({ length: HLL_REGISTERS }, () => 0),
  };
};

export class HyperLogLog {
  private readonly sketch: HllSketch;

  constructor(rawSketch?: unknown) {
    this.sketch = normalizeSketch(rawSketch);
  }

  add(element: string): this {
    const hashBits64 = hashTo64Bits(element);
    const suffixBitCount = 64 - this.sketch.precision;

    // Top `precision` bits select the register index.
    const registerIndex = Number(
      hashBits64 >> BigInt(suffixBitCount),
    );
    // Lower bits are used for rho(w): first 1-bit position.
    const suffixMask = (1n << BigInt(suffixBitCount)) - 1n;
    const suffixBits = hashBits64 & suffixMask;

    const leadingZeroRank = countLeadingZeros(suffixBits, suffixBitCount) + 1;
    this.sketch.registers[registerIndex] = Math.max(this.sketch.registers[registerIndex], leadingZeroRank);
    return this;
  }

  merge(other: HyperLogLog): this {
    // Merge by taking per-register maxima.
    for (let i = 0; i < HLL_REGISTERS; i += 1) {
      this.sketch.registers[i] = Math.max(this.sketch.registers[i], other.sketch.registers[i]);
    }
    return this;
  }

  estimateCount(): number {
    const registerCount = HLL_REGISTERS;
    const alphaCorrection = alphaForRegisterCount(registerCount);
    const inversePowerSum = this.sketch.registers.reduce(
      (sum, registerValue) => sum + Math.pow(2, -registerValue),
      0,
    );
    const rawEstimate = (alphaCorrection * registerCount * registerCount) / inversePowerSum;

    // Small-range correction: use linear counting when many registers are still zero.
    if (rawEstimate <= HLL_SMALL_RANGE_THRESHOLD_MULTIPLIER * registerCount) {
      const zeroRegisterCount = this.sketch.registers.filter((registerValue) => registerValue === 0).length;
      if (zeroRegisterCount > 0) {
        return registerCount * Math.log(registerCount / zeroRegisterCount);
      }

      return rawEstimate;
    }

    // Mid-range: raw HLL estimate is used directly.
    if (rawEstimate <= TWO_POW_32 / HLL_LARGE_RANGE_THRESHOLD_DIVISOR) {
      return rawEstimate;
    }

    // Large-range correction for very high cardinalities.
    return -TWO_POW_32 * Math.log(1 - rawEstimate / TWO_POW_32);
  }

  toSketch(): HllSketch {
    return {
      precision: this.sketch.precision,
      registers: [...this.sketch.registers],
    };
  }
}
