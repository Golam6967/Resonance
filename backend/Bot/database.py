import os
from langchain_chroma import Chroma
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_core.documents import Document

print("🤖 Initializing Local Hugging Face Embeddings (all-MiniLM-L6-v2)...")
hf_embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

# Define where your vector data will be stored on your local disk
CHROMA_PERSIST_DIR = os.path.join(os.path.dirname(__file__), "chroma_db")
collection_name = "paper_chunks"

async def store_paper_vectors(chunks: list, paper_id: int, start_page: int = 1):
    """
    Compiles raw strings into vector collections and stores them locally on disk.
    """
    print("🛠️ Accessing local vector store database...")
    
    # Chroma manages collection creation and vector size initialization automatically!
    store = Chroma(
        collection_name=collection_name,
        embedding_function=hf_embeddings,
        persist_directory=CHROMA_PERSIST_DIR
    )
    
    documents = [
        Document(
            page_content=chunk,
            metadata={"paper_id": paper_id, "page_number": start_page + idx}
        ) for idx, chunk in enumerate(chunks)
    ]
    
    print(f"📦 Saving {len(documents)} chunks locally to {CHROMA_PERSIST_DIR}...")
    # Chroma handles lists synchronously on disk, wrapping it cleanly
    store.add_documents(documents)
    print(f"✅ Successfully synchronized vectors locally.")


async def hybrid_retrieve(query: str, paper_id: int, k: int = 4) -> list:
    """
    Retrieves relevant text chunks matching the active paper ID workspace.
    """
    store = Chroma(
        collection_name=collection_name,
        embedding_function=hf_embeddings,
        persist_directory=CHROMA_PERSIST_DIR
    )
    
    print(f"🔍 Searching local Chroma database for: '{query}'...")
    
    # Chroma supports native metadata filtering matching MongoDB-style syntax
    results = store.similarity_search(
        query=query,
        k=k,
        filter={"paper_id": paper_id}
    )
    
    return results