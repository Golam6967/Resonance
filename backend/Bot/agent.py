import psycopg
from database import hybrid_retrieve
from config import get_llm, settings
from prompts import STAGE_1_META_PROMPT, FINAL_EXECUTION_BASE
from langchain_core.messages import HumanMessage
from langchain_postgres import PostgresChatMessageHistory

async def execution_agent_pipeline(
    user_query: str, 
    paper_id: int, 
    session_id: str,  # <-- Added unique session identifier string
    provider: str, 
    model: str
) -> str:
    """
    Two-Stage Prompt Generation Engine with Persistent Supabase Chat Memory
    """
    # 1. Establish an async connection block for tracking chat history tables
    async with await psycopg.AsyncConnection.connect(settings.DATABASE_URL) as conn:
        
        # 2. Initialize the Persistent Postgres Memory Layer via langchain-postgres
        chat_history = PostgresChatMessageHistory(
            table_name="agent_chat_history",
            session_id=session_id,
            async_connection=conn
        )
        
        # Auto-create memory tables if they don't exist yet
        await chat_history.acreate_tables()
        
        # 3. Retrieve past conversational context strings
        past_messages = await chat_history.aget_messages()
        
        # Format conversation history cleanly for our prompt builder
        formatted_history = ""
        for msg in past_messages[-6:]: # Pull the last 6 turns to keep context window light
            author = "User" if msg.type == "human" else "Assistant"
            formatted_history += f"{author}: {msg.content}\n"

        # 4. Run Hybrid Retrieval over papers
        context_docs = await hybrid_retrieve(query=user_query, paper_id=paper_id, k=4)
        
        formatted_context = ""
        for idx, doc in enumerate(context_docs):
            page = doc.metadata.get("page_number", "Unknown")
            formatted_context += f"[Document Section {idx+1} | Page: {page}]:\n{doc.page_content}\n\n"
            
        # 5. Stage 1: Dynamic Prompt Generation (Incorporate Chat History)
        meta_orchestrator = get_llm(provider=provider, model_name=model, temperature=0.1)
        
        # Inject context AND history so the meta-prompt understands current thread direction
        stage_1_input = STAGE_1_META_PROMPT.format(
            user_query=f"Conversation History:\n{formatted_history}\nCurrent Active Query: {user_query}",
            retrieved_context=formatted_context
        )
        
        meta_response = await meta_orchestrator.ainvoke([HumanMessage(content=stage_1_input)])
        dynamic_system_prompt = meta_response.content
        
        # 6. Stage 2: Execute Final Answer Generation Framework
        final_execution_prompt = FINAL_EXECUTION_BASE.format(
            dynamic_system_prompt=dynamic_system_prompt,
            user_query=user_query,
            retrieved_context=f"--- Chat History ---\n{formatted_history}\n--- Document Context ---\n{formatted_context}"
        )
        
        execution_engine = get_llm(provider=provider, model_name=model, temperature=0.3)
        final_response = await execution_engine.ainvoke([HumanMessage(content=final_execution_prompt)])
        
        # 7. COMMIT NEW INTERACTION TO SUPABASE MEMORY
        # This appends both messages permanently to your database cloud tables
        await chat_history.add_user_message(user_query)
        await chat_history.add_ai_message(final_response.content)
        
        return final_response.content