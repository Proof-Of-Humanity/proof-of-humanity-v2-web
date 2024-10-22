import { supportedChains } from "config/chains";
import { subgraph_url } from "config/subgraph";
import { StatusBanner } from "subgraph-status";
import styled from "styled-components";

const StyledBanner = styled(StatusBanner)`
  position: sticky !important;
  background-image: linear-gradient(to right, #ff9966, #ff8ca9);
  .status-text {
    h2 {
      margin: 0;
      line-height: 24px;
    }
  }
`;

function SubgraphsStatus() {
  const subgraphs: { name: string; url: string }[] = supportedChains.map(
    (chain) => ({
      name: `Subgraph on ${chain.name}`,
      url: subgraph_url[chain.id],
    }),
  );

  return <StyledBanner autoHide subgraphs={subgraphs} />;
}

export default SubgraphsStatus;
