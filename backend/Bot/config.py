import os
from dotenv import load_dotenv
from langchain.chat_models import init_chat_model

load_dotenv()

class Settings:
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL")
    SUPABASE_ANON_KEY: str = os.getenv("SUPABASE_ANON_KEY")
    
    # Validation
    if not DATABASE_URL or "psycopg" not in DATABASE_URL:
        raise ValueError("DATABASE_URL must be set and use the 'postgresql+psycopg://' scheme.")

settings = Settings()

def get_llm(provider: str = "google_genai", model_name: str = "gemini-1.5-pro", temperature: float = 0.2):
    """
    Utilizes LangChain's standard unified init_chat_model wrapper layer.
    Allows runtime swappability between providers ('google_genai', 'groq', etc.)
    """
    try:
        return init_chat_model(
            model=model_name,
            model_provider=provider,
            temperature=temperature
        )
    except Exception as e:
        raise RuntimeError(f"Failed to initialize Chat Model configuration for {provider}:{model_name}. Error: {str(e)}")