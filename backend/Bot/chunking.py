from langchain_experimental.text_splitter import SemanticChunker
from langchain_huggingface import HuggingFaceEmbeddings

print("🤖 Loading Local Sentence-Transformer into memory for Semantic Boundaries...")
# Initializing globally ensures the weights load exactly ONCE when the server boots up
breakpoint_embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

def generate_semantic_chunks(raw_markdown_text: str) -> list:
    """
    Analyzes markdown text strings and enforces structural break boundaries 
    based on embedding variance steps using a local transformer model.
    """
    print("✂️ Calculating semantic break thresholds...")
    
    # Initialize the chunker using a percentile threshold policy
    chunker = SemanticChunker(
        embeddings=breakpoint_embeddings,
        breakpoint_threshold_type="percentile",
        breakpoint_threshold_amount=90.0
    )
    
    # Split text into Document objects
    documents = chunker.create_documents([raw_markdown_text])
    print("Aise ettul")
    return [doc.page_content for doc in documents]