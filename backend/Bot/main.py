from fastapi import FastAPI, HTTPException, APIRouter
from pydantic import BaseModel
from chunking import generate_semantic_chunks
from database import store_paper_vectors
from agent import execution_agent_pipeline
from dotenv import load_dotenv,dotenv_values
load_dotenv()
import fitz
import requests
import io
import cloudinary
import cloudinary.uploader
import os
import re
from collections import Counter
app = FastAPI(title="AI Research Engine Brain Instance", version="1.0.0")

# ── Pydantic Payloads ──────────────────────────────────────────────────────────
class IngestionPayload(BaseModel):
    paper_id: int
    raw_markdown_content: str
    starting_page: int = 1

class QueryPayload(BaseModel):
    paper_id: int
    session_id: str
    user_query: str
    llm_provider: str = "google_genai"  # Alternative configurations: "groq"
    model_name: str = "gemini-1.5-pro"  # Alternative configurations: "llama3-70b-8192"

class DeletePayload(BaseModel):
    paper_id: int

# 🔴 NEW: Global Query Request Body Payload Structure
class GlobalQueryPayload(BaseModel):
    query: str
    user_id: int
class HighlightPayload(BaseModel):
    cloudinary_url: str
    min_word_length: int = 5
    top_n_words: int = 5

# ── Existing Endpoints ─────────────────────────────────────────────────────────
@app.post("/api/v1/ingest")
async def process_paper_ingestion(payload: IngestionPayload):
    try:
        print("ekhane toh ache")
        chunks = generate_semantic_chunks(payload.raw_markdown_content)
        
        await store_paper_vectors(
            chunks=chunks, 
            paper_id=payload.paper_id, 
            start_page=payload.starting_page
        )
        return {"success": True, "chunks_processed": len(chunks), "message": "Paper semantic segments mapped successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v1/query")
async def query_research_agent(payload: QueryPayload):
    try:
        print("Ekhane to ashche")
        response_analysis = await execution_agent_pipeline(
            user_query=payload.user_query,
            paper_id=payload.paper_id,
            session_id=payload.session_id,
            provider=payload.llm_provider,
            model=payload.model_name
        )
        return {"success": True, "analysis": response_analysis}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v1/delete-paper")
async def delete_paper_vectors(payload: DeletePayload):
    try:
        from database import collection_name, hf_embeddings, CHROMA_PERSIST_DIR
        from langchain_chroma import Chroma
        
        print(f"🗑️ Deleting all vector chunks for Paper ID: {payload.paper_id}...")
        
        store = Chroma(
            collection_name=collection_name,
            embedding_function=hf_embeddings,
            persist_directory=CHROMA_PERSIST_DIR
        )
        
        store.delete(filter={"paper_id": payload.paper_id})
        return {"success": True, "message": f"All chunks associated with paper {payload.paper_id} have been purged."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))    

# ── 🔴 NEW: Global Chatbot Vault Router Endpoint ──────────────────────────────────
@app.post("/api/v1/rag/global-query")
@app.post("/api/v1/rag/global-query")
async def execute_global_vault_rag(payload: GlobalQueryPayload):
    try:
        print("Eta print hoy kina dekhi")
        import groq  # 🔴 SWAPPED: Using Groq SDK instead of OpenAI
        import os
        from database import collection_name, hf_embeddings, CHROMA_PERSIST_DIR
        from langchain_chroma import Chroma
        
        config = dotenv_values(".env")


        print(f"🌐 Querying global database vault for query: {payload.query}")

        # 1. Access your existing vector store instance
        store = Chroma(
            collection_name=collection_name,
            embedding_function=hf_embeddings,
            persist_directory=CHROMA_PERSIST_DIR
        )

        # 2. Perform cross-document similarity lookup (pulling top 4 matching segments)
        docs = store.similarity_search(payload.query, k=4)
        
        # 3. Extract text strings from retrieved document pages
        context_block = "\n\n".join([doc.page_content for doc in docs]) if docs else "No relevant document fragments found."

        # 4. Construct explicit analysis system prompt instructions
        system_instructions = (
            "You are an expert AI Research Assistant. Synthesize information across multiple papers in the vault.\n"
            "Use markdown bold tags (**bold**) for key technical phrases. Maintain structured, readable paragraphs.\n\n"
            f"--- RELEVANT CONTEXT CHUNKS FROM VAULT ---\n{context_block}"
        )

        # 5. Initialize the Groq Client (Grabs GROQ_API_KEY from your backend .env configuration file)
        print("Ekhane ashe?")
        print(os.environ.get("GROQ_API_KEY"))
        groq_key = config.get("GROQ_API_KEY") or os.environ.get("GROQ_API_KEY")
        client = groq.Groq(api_key=groq_key)
        
        # 6. Execute inference model call targeting Llama 3 for blistering speed
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # 🟢 High-performance reasoning model choice
            messages=[
                {"role": "system", "content": system_instructions},
                {"role": "user", "content": payload.query}
            ],
            temperature=0.2
        )
        
        ai_generated_answer = completion.choices[0].message.content
        return {"success": True, "response": ai_generated_answer}

    except Exception as e:
        print(f"💥 Global RAG error context: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# Add this endpoint above your main running entry point check code block
cloudinary.config(
    cloud_name=os.environ.get("CLOUDINARY_CLOUD_NAME"),
    api_key=os.environ.get("CLOUDINARY_API_KEY"),
    api_secret=os.environ.get("CLOUDINARY_API_SECRET")
)

from fastapi.responses import StreamingResponse
import io

@app.post("/api/v1/pdf/highlight-common")
async def execute_semantic_pdf_highlighting(payload: HighlightPayload):
    try:
        import groq 
        import json
        # 1. Download the original PDF from Cloudinary
        res = requests.get(payload.cloudinary_url)

        if res.status_code != 200:
            raise HTTPException(
                status_code=400,
                detail="Unable to retrieve source asset from Cloudinary.",
            )

        pdf_bytes = io.BytesIO(res.content)
        doc = fitz.open(stream=pdf_bytes, filetype="pdf")

        # 2. 🟢 EXTRACT TEXT FOR LLM CONTEXT (Read first 3 pages)
        context_text = ""
        for i in range(min(3, len(doc))):
            context_text += doc[i].get_text("text") + "\n"

        # 3. 🟢 QUERY GROQ AI FOR KEYWORDS
        # Ensure you have your GROQ_API_KEY set up in your environment (.env)
        client = groq.Groq(api_key=os.environ.get("GROQ_API_KEY"))

        system_prompt = (
            "You are an advanced academic research assistant analyzing a computer science/software engineering paper.\n"
            "Identify the top 5 most critical technical terms, algorithms, systems, or core methodologies central to this work.\n"
            "Your output MUST be a valid, raw JSON array of strings containing ONLY lowercase words or short multi-word phrases.\n"
            "Do not return markdown wrappers, code blocks, or conversational text. Just the raw valid array.\n"
            'Example Format: ["microservices", "concurrency control", "docker"]'
        )

        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "user",
                    "content": f"{system_prompt}\n\n--- PAPER EXCERPT ---\n{context_text[:6000]}",
                }
            ],
            temperature=0.1,
        )
    

        raw_output = completion.choices[0].message.content.strip()
        print(raw_output)

        # Clean up any accidental markdown blocks Groq might still send back
        if raw_output.startswith("```"):
            raw_output = (
                raw_output.replace("```json", "").replace("```", "").strip()
            )

        try:
            target_keywords = json.loads(raw_output)
            
            # Standardize everything to lowercase text strings to guarantee clean searching
            target_keywords = [
                str(word).strip().lower() for word in target_keywords
            ]
        except Exception:
            # Fallback terms if JSON parsing drops tracking coordinates
            target_keywords = ["framework", "architecture", "methodology"]

        print(f"🎯 AI-Generated Keywords to Highlight: {target_keywords}")

        # 4. 🟢 PAINT HIGHLIGHT RECTANGLES ONTO PDF PAGES
        for page in doc:
            for word in target_keywords:
                if not word or len(word) < 3:
                    continue

                # 🟢 NEW UPDATED SEARCH CONFIGURATION:
                # We remove 'flags=fitz.TEXT_DEHYPHEN' and instead use:
                # - quads=True: Returns coordinates as precise quadrilateral shapes 
                #   (perfect for multi-column academic layouts).
                # PyMuPDF searches case-insensitively by default now!
                instances = page.search_for(word, quads=True)

                for quad in instances:
                    # We pass the quad directly into the highlight tool layer
                    annot = page.add_highlight_annot(quad)
                    annot.set_colors(stroke=[1, 1, 0])  # Vibrant Yellow
                    annot.update()
        # 5. Save modified document matrix to memory buffer stream
        out_stream = io.BytesIO()
        doc.save(
            out_stream,
            garbage=3,  # Cleans out unused objects to prevent memory bloating
            deflate=True,  # Compresses streams to reduce size tracks
            clean=True,  # Standardizes structural content maps
        )

        # Move the internal read pointer back to the absolute beginning of the file!
        out_stream.seek(0)
        doc.close()

        # 6. Return a clean StreamingResponse straight out of Python
        return StreamingResponse(
            out_stream,
            media_type="application/pdf",
            headers={
                "Content-Disposition": "attachment; filename=highlighted.pdf"
            },
        )

    except Exception as err:
        print(f"💥 Internal highlight exception trace: {str(err)}")
        raise HTTPException(status_code=500, detail=str(err))
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)