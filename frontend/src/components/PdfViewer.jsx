import React from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";

// Safely pull layout CSS parameters from node_modules
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

export default function PdfViewer({ url }) {
  // Initialize the default side toolbar layout plugin instance
  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  if (!url) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          color: "#a1a1aa",
        }}
      >
        ⚠️ No PDF asset stream coordinates provided.
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "#09090b",
        overflow: "hidden",
      }}
    >
      <div style={{ flex: 1, overflow: "auto" }}>
        {/* Inject stable Mozilla PDFJS worker cdn thread */}
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          <Viewer
            fileUrl={url}
            plugins={[defaultLayoutPluginInstance]}
            theme="dark"
          />
        </Worker>
      </div>
    </div>
  );
}
