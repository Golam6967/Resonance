const prisma = require("../config/prisma");
const axios = require("axios");

// 🟢 Get or create the unified Global Chat Session
const getOrCreateGlobalSession = async (req, res) => {
  try {
    let session = await prisma.chatSession.findFirst({
      where: { paperId: null, userId: 1 },
      include: { messages: { orderBy: { createdAt: "asc" } } }
    });

    if (!session) {
      session = await prisma.chatSession.create({
        data: { paperId: null, userId: 1, title: "Global Vault Analysis" },
        include: { messages: true }
      });
    }

    return res.status(200).json({ success: true, data: session });
  } catch (error) {
    console.error("💥 Error loading global session:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 🟢 Orchestrate human message prompts, execute FastAPI RAG calculation, and log results
const processGlobalQuery = async (req, res) => {
  try {
    const { sessionId, content } = req.body;
    const sessionIdInt = parseInt(sessionId);

    // Step A: Persist user's message row right away
    const userMessage = await prisma.chatMessage.create({
      data: { sessionId: sessionIdInt, role: "user", content }
    });

    // Step B: Trigger semantic calculation query inside FastAPI pipeline
    let aiResponseText = "I encountered an error querying the context repository components.";
    try {
      const fastApiResult = await axios.post("http://127.0.0.1:8000/api/v1/rag/global-query", {
        query: content,
        user_id: 1
      });
      aiResponseText = fastApiResult.data.response;
    } catch (fastApiError) {
      console.error("💥 FastAPI processing cluster timed out or threw error:", fastApiError.message);
      aiResponseText = `⚠️ **Backend processing error**: Failed to communicate with FastAPI RAG core. Details: ${fastApiError.message}`;
    }

    // Step C: Persist generated answer row back into Postgres
    const assistantMessage = await prisma.chatMessage.create({
      data: { sessionId: sessionIdInt, role: "assistant", content: aiResponseText }
    });

    return res.status(201).json({
      success: true,
      data: {
        userMessage,
        assistantMessage
      }
    });
  } catch (error) {
    console.error("💥 Error in processGlobalQuery orchestrator:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
};

// 🟢 Clear historical interaction logs for this global workspace
const clearGlobalChat = async (req, res) => {
  try {
    const { sessionId } = req.params;
    await prisma.chatMessage.deleteMany({
      where: { sessionId: parseInt(sessionId) }
    });
    return res.status(200).json({ success: true, message: "Chat logs purged cleanly." });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = { getOrCreateGlobalSession, processGlobalQuery, clearGlobalChat };