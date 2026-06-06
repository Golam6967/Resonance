import { useState, useCallback, useEffect } from "react";

// Adjust this base URL according to your Express server configuration port
const API_BASE_URL = "http://localhost:5000/api/upload";

export function usePapers() {
  const [papers, setPapers] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // 🟢 1. Fetch initial papers from Supabase via Prisma on hook mount
  const fetchPapers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/papers`); // Assumes a standard GET endpoint
      if (!response.ok)
        throw new Error("Failed to pull research papers from database.");

      const resData = await response.json();
      console.log(resData);

      // Adjust according to your standard backend wrapper format (e.g., resData.data)
      setPapers(resData.data || resData);
    } catch (err) {
      console.error("❌ Error fetching papers:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPapers();
  }, [fetchPapers]);

  const selectedPaper = papers.find((p) => p.id === selectedId) ?? null;

  const filteredPapers = papers.filter((p) => {
    if (!filter.trim()) return true;
    const q = filter.toLowerCase();
    return (
      (p.title && p.title.toLowerCase().includes(q)) ||
      (p.authors && p.authors.toLowerCase().includes(q)) ||
      (p.tags ?? []).some((t) => t.toLowerCase().includes(q))
    );
  });

  // 🟢 2. Connect addPaper to your Express Multer upload endpoint
  const addPaper = useCallback(async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      // 🔴 THE KEY FIX: The modal has already appended the file payload!
      // We just need to make sure the key name matches your Express Multer config exactly.
      // If your modal appended it as 'file', but Multer expects 'paper', we swap it here:
      if (formData.has("file") && !formData.has("paper")) {
        formData.append("paper", formData.get("file"));
        formData.delete("file");
      }

      // Parse values from the form data to build your immediate optimistic UI snapshot
      const formTitle = formData.get("title") || "Parsing document...";
      const formAuthors = formData.get("authors") || "Unknown";
      const formYear = formData.get("year") || new Date().getFullYear();

      let formTags = [];
      try {
        if (formData.get("tags")) {
          formTags = JSON.parse(formData.get("tags"));
        }
      } catch (e) {
        formTags = [];
      }

      const response = await fetch(`${API_BASE_URL}/paper`, {
        method: "POST",
        body: formData, // Browser automatically sets dynamic multipart boundaries
      });

      if (!response.ok)
        throw new Error("File upload failed down the pipeline.");

      const result = await response.json();

      if (result.success) {
        // Optimistically insert backend parsed values into your local state array
        const savedPaper = {
          id: result.data.id,
          title: result.data.title || formTitle,
          cloudinaryUrl:
            result.data.cloudinary_url || result.data.cloudinaryUrl,
          authors: result.data.authors || formAuthors,
          year: result.data.year || formYear,
          tags: result.data.tags || formTags,
          status: "queued",
          uploadedAt: new Date().toISOString(),
        };

        setPapers((prev) => [savedPaper, ...prev]);
        return result.data.id;
      } else {
        throw new Error(result.message || "Unknown error during ingestion.");
      }
    } catch (err) {
      console.error("❌ Error adding paper:", err);
      setError(err.message);
      throw err; // Throws error back to modal so it can show the red error banner
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 🟢 3. Connect updatePaper to handle state patch modifications
  const updatePaper = useCallback(async (id, updates) => {
    try {
      // Optional: Add a patch endpoint request here if updating title/metadata permanently
      // await fetch(`${API_BASE_URL}/paper/${id}`, { method: 'PATCH', ... })

      setPapers((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p)),
      );
    } catch (err) {
      console.error("❌ Error updating paper state:", err);
    }
  }, []);

  // 🟢 4. Connect removePaper to your brand new closed-loop DELETE route
  const removePaper = useCallback(
    async (id) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${API_BASE_URL}/paper/${id}`, {
          method: "DELETE",
        });

        if (!response.ok)
          throw new Error("Failed to purge paper from backends.");
        const result = await response.json();

        if (result.success) {
          // If successful on backend tiers, drop safely from UI state
          setPapers((prev) => prev.filter((p) => p.id !== id));
          if (selectedId === id) setSelectedId(null);
          console.log("🧹 Closed-loop asset and chunk deletion confirmed.");
        } else {
          throw new Error(result.message || "Deletion sequence failed.");
        }
      } catch (err) {
        console.error("❌ Error removing paper:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [selectedId],
  );

  return {
    papers,
    filteredPapers,
    selectedPaper,
    selectedId,
    filter,
    isLoading,
    error,
    setFilter,
    setSelectedId,
    addPaper,
    updatePaper,
    removePaper,
    refreshPapers: fetchPapers, // Expose to allow manual refetching
  };
}
