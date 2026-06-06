import { useState } from "react";
import { Layout } from "./components/Layout";
import { Dashboard } from "./views/Dashboard";
import { PaperVault } from "./views/PaperVault";
import { AIChat } from "./views/AIChat";
import { usePapers } from "./hooks/usePapers";
import { useChat } from "./hooks/useChat";

export default function App() {
  const [active, setActive] = useState("dashboard");

  const {
    papers,
    filteredPapers,
    selectedPaper,
    selectedId,
    filter,
    setFilter,
    setSelectedId,
    addPaper,
    updatePaper,
    removePaper,
  } = usePapers();

  const {
    messages,
    input,
    setInput,
    isLoading,
    error,
    sendMessage,
    clearMessages,
  } = useChat();

  return (
    <Layout active={active} setActive={setActive}>
      {active === "dashboard" && (
        <Dashboard papers={papers} setActive={setActive} />
      )}

      {active === "vault" && (
        <PaperVault
          filteredPapers={filteredPapers}
          selectedPaper={selectedPaper}
          selectedId={selectedId}
          filter={filter}
          setFilter={setFilter}
          setSelectedId={setSelectedId}
          addPaper={addPaper}
          updatePaper={updatePaper}
          removePaper={removePaper}
        />
      )}

      {active === "chat" && (
        <AIChat
          messages={messages}
          input={input}
          setInput={setInput}
          isLoading={isLoading}
          error={error}
          sendMessage={sendMessage}
          clearMessages={clearMessages}
          papers={papers}
        />
      )}
    </Layout>
  );
}
