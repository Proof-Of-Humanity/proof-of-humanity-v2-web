import { type DocRenderer, textFileLoader } from "@cyntler/react-doc-viewer";
import React from "react";
import { sanitizeHtml } from "../sanitizeHtml";

const HtmlRenderer: DocRenderer = ({ mainState: { currentDocument } }) => {
  const html =
    typeof currentDocument?.fileData === "string"
      ? sanitizeHtml(currentDocument.fileData)
      : "";

  return (
    <iframe
      className="h-[70vh] w-full bg-white"
      sandbox=""
      srcDoc={html}
      title="HTML attachment"
    />
  );
};

HtmlRenderer.fileTypes = ["htm", "html", "text/htm", "text/html"];
HtmlRenderer.weight = 1;
HtmlRenderer.fileLoader = textFileLoader;

export default HtmlRenderer;
