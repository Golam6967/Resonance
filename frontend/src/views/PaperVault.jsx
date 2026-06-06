import { useState } from "react";
import { colors, font, radius } from "../lib/theme";
import {
  Card,
  StatusBadge,
  Tag,
  EmptyState,
  Input,
  Spinner,
} from "../components/ui/index";
import { Button } from "../components/ui/Button";

// ── Upload Modal ───────────────────────────────────────────────────────────────
export function UploadModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    title: "",
    authors: "",
    year: "",
    tags: "",
  });
  const [file, setFile] = useState(null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== "application/pdf") {
        setError("Only PDF documents are supported.");
        setFile(null);
        return;
      }
      setError("");
      setFile(selectedFile);

      // Auto-fill the title from the filename if it's empty
      if (!form.title.trim()) {
        const cleanTitle = selectedFile.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[_-]/g, " ");
        setForm((f) => ({ ...f, title: cleanTitle }));
      }
    }
  };

  const handleSubmit = async () => {
    if (!form.title.trim()) {
      setError("Paper title is required.");
      return;
    }
    if (!file) {
      setError("Please select a PDF document file to upload.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // 🟢 Construct Multipart Form Data
      const formData = new FormData();
      formData.append("title", form.title.trim());
      formData.append("authors", form.authors.trim());
      formData.append("year", parseInt(form.year, 10) || "");

      // Format tags array into standard comma strings or loop appends depending on your backend
      const parsedTags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      formData.append("tags", JSON.stringify(parsedTags));

      // Append the actual binary file object (matches req.file key name in your Express Multer config)
      formData.append("file", file);

      // Trigger the parent submission function
      await onSubmit(formData);
      onClose();
    } catch (err) {
      setError(
        err.message || "Something failed during your file asset upload.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        backdropFilter: "blur(4px)",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.borderMid}`,
          borderRadius: radius.xl,
          padding: "28px 28px 24px",
          width: 440,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          animation: "fadeUp 0.2s ease both",
        }}
      >
        <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>

        <div>
          <h2
            style={{
              fontFamily: font.sans,
              fontSize: "15px",
              fontWeight: 600,
              color: colors.textPrimary,
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Add Paper to Vault
          </h2>
          <p
            style={{
              fontFamily: font.sans,
              fontSize: "12px",
              color: colors.textTertiary,
              marginTop: 4,
              letterSpacing: "-0.01em",
            }}
          >
            Upload your document source. The backend chunks text contents and
            secures delivery targets.
          </p>
        </div>

        {/* 🔴 NEW: Native File Drag and Drop / Input Upload Slot */}
        <div>
          <label
            style={{
              display: "block",
              fontFamily: font.sans,
              fontSize: "12px",
              fontWeight: 500,
              color: colors.textSecondary,
              marginBottom: 6,
            }}
          >
            Document File <span style={{ color: colors.accent }}>*</span>
          </label>
          <div
            style={{
              border: `1.5px dashed ${file ? colors.accentGlow : colors.border}`,
              borderRadius: radius.md,
              padding: "16px",
              textAlign: "center",
              background: file ? colors.bgOverlay : "transparent",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              transition: "border 0.15s ease",
              position: "relative",
            }}
          >
            <input
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
              disabled={isSubmitting}
              style={{
                position: "absolute",
                inset: 0,
                opacity: 0,
                cursor: "pointer",
              }}
            />
            <svg
              style={{
                marginBottom: 6,
                color: file ? colors.accent : colors.textTertiary,
              }}
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 16v-8m0 8l-3-3m3 3l3-3M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p
              style={{
                fontFamily: font.sans,
                fontSize: "12px",
                color: file ? colors.textPrimary : colors.textSecondary,
                margin: 0,
                fontWeight: file ? 500 : 400,
              }}
            >
              {file ? file.name : "Click or drag a PDF paper file here"}
            </p>
            {file && (
              <span
                style={{
                  fontFamily: font.sans,
                  fontSize: "10px",
                  color: colors.textTertiary,
                }}
              >
                {(file.size / (1024 * 1024)).toFixed(2)} MB
              </span>
            )}
          </div>
        </div>

        {/* Metadata Inputs */}
        {[
          {
            key: "title",
            label: "Title",
            placeholder: "e.g. Attention Is All You Need",
            required: true,
          },
          {
            key: "authors",
            label: "Authors",
            placeholder: "e.g. Vaswani et al.",
          },
          { key: "year", label: "Year", placeholder: "e.g. 2017" },
          {
            key: "tags",
            label: "Tags",
            placeholder: "e.g. transformer, nlp (comma-separated)",
          },
        ].map(({ key, label, placeholder, required }) => (
          <div key={key}>
            <label
              style={{
                display: "block",
                fontFamily: font.sans,
                fontSize: "12px",
                fontWeight: 500,
                color: colors.textSecondary,
                marginBottom: 6,
                letterSpacing: "-0.01em",
              }}
            >
              {label}{" "}
              {required && (
                <span style={{ color: colors.accent, marginLeft: 3 }}>*</span>
              )}
            </label>
            <Input
              value={form[key]}
              disabled={isSubmitting}
              onChange={(val) => {
                setForm((f) => ({ ...f, [key]: val }));
                if (key === "title") setError("");
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              placeholder={placeholder}
            />
          </div>
        ))}

        {error && (
          <p
            style={{
              fontFamily: font.sans,
              fontSize: "12px",
              color: colors.danger,
              margin: 0,
            }}
          >
            {error}
          </p>
        )}

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 4,
          }}
        >
          <Button variant="ghost" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Uploading Document..." : "Add Paper"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Panel ───────────────────────────────────────────────────────────────
export function DetailPanel({ paper, onRemove }) {
  const [isHighlighting, setIsHighlighting] = useState(false);

  if (!paper) {
    return (
      <div
        style={{
          background: colors.bgCard,
          border: `1px solid ${colors.border}`,
          borderRadius: radius.lg,
          height: "100%",
        }}
      >
        <EmptyState
          icon={
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          }
          title="No paper selected"
          description="Select a paper from the list to view its details."
        />
      </div>
    );
  }

  const handlePdfView = () => {
    if (paper?.cloudinaryUrl || paper?.cloudinary_url) {
      window.open(
        paper.cloudinaryUrl || paper.cloudinary_url,
        "_blank",
        "noopener,noreferrer",
      );
    } else {
      alert("No PDF link has been registered for this research item yet.");
    }
  };

  // 🟢 NEW: Handles fetching binary PDF array buffers and forcing a clean file download
  // 🟢 COHESIVE BYPASS FIX: Handles absolute binary parsing and skips past IDM
  const handleDownloadHighlightedPdf = async () => {
    setIsHighlighting(true);
    try {
      console.log("Downloading paper:", paper.id);

      // 1. Hit your exact endpoint path
      const response = await fetch(
        `http://localhost:5000/api/upload/papers/${paper.id}/highlight`,
        {
          method: "POST",
        },
      );

      if (!response.ok) {
        throw new Error(
          "Highlight processing engine rejected document generation.",
        );
      }

      // 2. 🟢 CAPTURE THE DIRECT STREAM: Because the backend used .pipe(),
      // this blob captures the exact uncorrupted bytes sent by PyMuPDF
      const pdfBlob = await response.blob();

      // 3. Create a clean download anchor link
      const clientUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement("a");

      link.href = clientUrl;
      link.setAttribute(
        "download",
        `LLM_Highlighted_${paper.title.replace(/\s+/g, "_")}.pdf`,
      );

      document.body.appendChild(link);
      link.click();

      // Clean up the virtual DOM references immediately
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(clientUrl);
    } catch (err) {
      console.error("💥 Highlight compilation failure:", err);
      alert("Failed to compile highlighted document layers: " + err.message);
    } finally {
      setIsHighlighting(false);
    }
  };

  return (
    <div
      style={{
        background: colors.bgCard,
        border: `1px solid ${colors.border}`,
        borderRadius: radius.lg,
        padding: "22px",
        display: "flex",
        flexDirection: "column",
        gap: 18,
        animation: "fadeUp 0.2s ease both",
      }}
    >
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}`}</style>

      {/* Header */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <StatusBadge status={paper.status} />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(paper.id)}
            style={{ color: colors.textTertiary, padding: "4px 8px" }}
          >
            <svg
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
            >
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </Button>
        </div>
        <h2
          style={{
            fontFamily: font.sans,
            fontSize: "15px",
            fontWeight: 600,
            color: colors.textPrimary,
            letterSpacing: "-0.02em",
            lineHeight: 1.4,
            margin: 0,
          }}
        >
          {paper.title}
        </h2>
        {paper.authors && (
          <p
            style={{
              fontFamily: font.sans,
              fontSize: "12px",
              color: colors.textSecondary,
              margin: "5px 0 0 0",
              letterSpacing: "-0.01em",
            }}
          >
            {paper.authors} {paper.year ? ` · ${paper.year}` : ""}
          </p>
        )}
      </div>

      <div style={{ height: 1, background: colors.border }} />

      {/* Tags */}
      {paper.tags && paper.tags.length > 0 && (
        <div>
          <div
            style={{
              fontFamily: font.sans,
              fontSize: "11px",
              fontWeight: 600,
              color: colors.textTertiary,
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              marginBottom: 8,
            }}
          >
            Tags
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {paper.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </div>
        </div>
      )}

      {/* Metadata Table */}
      <div>
        <div
          style={{
            fontFamily: font.sans,
            fontSize: "11px",
            fontWeight: 600,
            color: colors.textTertiary,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            marginBottom: 10,
          }}
        >
          Metadata
        </div>
        {[
          { label: "Paper ID", value: paper.id },
          {
            label: "Added",
            value: new Date(paper.createdAt || Date.now()).toLocaleDateString(
              "en-US",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
              },
            ),
          },
          paper.diagramCount > 0 && {
            label: "Diagrams extracted",
            value: paper.diagramCount,
          },
        ]
          .filter(Boolean)
          .map((row) => (
            <div
              key={row.label}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 0",
                borderBottom: `1px solid ${colors.border}`,
              }}
            >
              <span
                style={{
                  fontFamily: font.sans,
                  fontSize: "12px",
                  color: colors.textTertiary,
                }}
              >
                {row.label}
              </span>
              <span
                style={{
                  fontFamily: font.sans,
                  fontSize: "12px",
                  color: colors.textSecondary,
                  letterSpacing: "-0.01em",
                }}
              >
                {row.value}
              </span>
            </div>
          ))}

        {/* Action Button Strip Row */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            flexDirection: "column",
            gap: 10,
          }}
        >
          <Button
            variant="primary"
            onClick={handlePdfView}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            Open Document Source
          </Button>

          {/* 🟢 NEW: Intelligent Highlight Execution Trigger */}
          <Button
            variant="secondary"
            disabled={isHighlighting}
            onClick={handleDownloadHighlightedPdf}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 6,
              fontSize: "12px",
            }}
          >
            {isHighlighting ? (
              <>
                <Spinner size={12} color={colors.textSecondary} />
                <span>Extracting LLM Keywords...</span>
              </>
            ) : (
              <>
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
                <span>Download Smart Highlighted PDF</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Analysis placeholder */}
      {paper.status === "indexed" && !paper.analysis && (
        <div
          style={{
            background: colors.bgOverlay,
            border: `1px solid ${colors.borderMid}`,
            borderRadius: radius.md,
            padding: "14px 16px",
          }}
        >
          <p
            style={{
              fontFamily: font.sans,
              fontSize: "12px",
              color: colors.textTertiary,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            AI extraction (problem, solution, drawbacks) will appear here once
            the backend processes this paper.
          </p>
        </div>
      )}
    </div>
  );
}

// ── Main View ─────────────────────────────────────────────────────────────────
export function PaperVault({
  filteredPapers,
  selectedPaper,
  selectedId,
  filter,
  setFilter,
  setSelectedId,
  addPaper,
  removePaper,
}) {
  const [showModal, setShowModal] = useState(false);

  return (
    <div style={{ animation: "fadeIn 0.25s ease both" }}>
      <style>{`@keyframes fadeIn{from{opacity:0}to{opacity:1}}`}</style>

      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 20,
          alignItems: "center",
        }}
      >
        <div style={{ flex: 1, maxWidth: 320 }}>
          <Input
            value={filter}
            onChange={setFilter}
            placeholder="Search by title, author, or tag…"
          />
        </div>
        <Button variant="primary" onClick={() => setShowModal(true)}>
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Paper
        </Button>
      </div>

      {/* Split layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: 16,
          alignItems: "start",
        }}
      >
        {/* List */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filteredPapers.length === 0 ? (
            <div
              style={{
                background: colors.bgCard,
                border: `1px solid ${colors.border}`,
                borderRadius: radius.lg,
              }}
            >
              <EmptyState
                icon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                }
                title={
                  filter ? "No papers match your search" : "No papers in vault"
                }
                description={
                  filter
                    ? "Try a different search term."
                    : "Add your first paper using the button above."
                }
              />
            </div>
          ) : (
            filteredPapers.map((paper) => (
              <Card
                key={paper.id}
                selected={selectedId === paper.id}
                onClick={() => setSelectedId(paper.id)}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0, marginRight: 12 }}>
                    <div
                      style={{
                        fontFamily: font.sans,
                        fontSize: "13px",
                        fontWeight: 500,
                        color: colors.textPrimary,
                        letterSpacing: "-0.01em",
                        lineHeight: 1.4,
                        marginBottom: 4,
                      }}
                    >
                      {paper.title}
                    </div>
                    {paper.authors && (
                      <div
                        style={{
                          fontFamily: font.sans,
                          fontSize: "12px",
                          color: colors.textTertiary,
                          marginBottom: 10,
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {paper.authors}
                        {paper.year ? ` · ${paper.year}` : ""}
                      </div>
                    )}
                    {paper.tags && paper.tags.length > 0 && (
                      <div
                        style={{ display: "flex", gap: 5, flexWrap: "wrap" }}
                      >
                        {paper.tags.slice(0, 4).map((tag) => (
                          <Tag key={tag}>{tag}</Tag>
                        ))}
                        {paper.tags.length > 4 && (
                          <Tag>+{paper.tags.length - 4}</Tag>
                        )}
                      </div>
                    )}
                  </div>
                  <div style={{ flexShrink: 0 }}>
                    <StatusBadge status={paper.status} />
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Detail */}
        <div style={{ position: "sticky", top: 84 }}>
          <DetailPanel paper={selectedPaper} onRemove={removePaper} />
        </div>
      </div>

      {showModal && (
        <UploadModal onClose={() => setShowModal(false)} onSubmit={addPaper} />
      )}
    </div>
  );
}
