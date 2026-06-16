import React from "react";
import DocViewer, { DocViewerRenderers } from "@cyntler/react-doc-viewer";
import { IS_MOBILE } from "utils/media";
import MarkdownRenderer from "./Viewers/MarkdownViewer";

import "@cyntler/react-doc-viewer/dist/index.css";

const SAFE_FILE_TYPES = new Set<string>([
  "pdf",
  "application/pdf",
  "jpg",
  "jpeg",
  "image/jpg",
  "image/jpeg",
  "png",
  "image/png",
  "webp",
  "image/webp",
  "video/mp4",
]);

const SafeDocViewerRenderers = DocViewerRenderers.filter((renderer) =>
  renderer.fileTypes.some((fileType: string) => SAFE_FILE_TYPES.has(fileType)),
).concat(MarkdownRenderer);

/**
 * @description this viewer supports loading multiple files, it can load urls, local files, etc
 * @param url The url of the file to be displayed
 * @returns renders the file
 */
const FileViewer: React.FC<{ url: string }> = ({ url }) => {
  const docs = [{ uri: url }];

  return (
    <div className="text-primaryText">
      <DocViewer
        documents={docs}
        pluginRenderers={SafeDocViewerRenderers}
        config={{
          header: {
            disableHeader: true,
            disableFileName: true,
          },
          pdfZoom: {
            defaultZoom: IS_MOBILE ? 1.4 : 0.8,
            zoomJump: 0.1,
          },
          pdfVerticalScrollByDefault: true,
        }}
        className="bg-primaryBackground"
      />
    </div>
  );
};

export default FileViewer;
