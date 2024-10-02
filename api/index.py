from fastapi import FastAPI, HTTPException, File, UploadFile
from langchain_core.messages import AIMessage, HumanMessage
from langchain_community.document_loaders import WebBaseLoader, PyPDFLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma, FAISS
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from pydantic import BaseModel
from dotenv import load_dotenv
import tempfile

app = FastAPI()
load_dotenv()

chat_history = [AIMessage(content="Hello, How can I help you Today?")]
vector_store = None


class RAGModel(BaseModel):
    openAiApiKey: str = None
    url: str = None
    message: str = None

@app.post("/api/scrape")
async def get_vectorstore_from_url(item: RAGModel):
    
    url = item.url

    try:
        loader = WebBaseLoader(url)
        document = loader.load()
        text_splitter = RecursiveCharacterTextSplitter()
        document_chunks = text_splitter.split_documents(document)
        
        embeddings = OpenAIEmbeddings()
        
        global vector_store
        vector_store = Chroma.from_documents(document_chunks, embeddings)
        return {"message": "URL is uploaded and Vector store initialized"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
  
uploaded_files = {}

@app.post("/api/upload_document")
async def upload_document(file: UploadFile = File(...)):

    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as temp_file:
            temp_file_name = temp_file.name
            content = await file.read()
            temp_file.write(content)
            temp_file.flush()  

            file_key = file.filename
            uploaded_files[file_key] = temp_file_name

            loader = PyPDFLoader(temp_file_name)
            document = loader.load()
            text_splitter = RecursiveCharacterTextSplitter()
            document_chunks = text_splitter.split_documents(document)

            embeddings = OpenAIEmbeddings()
            global vector_store
            vector_store = FAISS.from_documents(document_chunks, embeddings)

            return {"message": "Document successfully uploaded and vector store initialized", "file_key": file_key}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail="Error processing document")


@app.post("/api/chat")
async def chat(request: RAGModel):
    
    if vector_store is None:
        raise HTTPException(status_code=404, detail="Vector store not found")

    try:
        user_message = HumanMessage(content=request.message)
        retriever_chain = get_context_retriever_chain(vector_store)
        conversation_rag_chain = get_conversational_rag_chain(retriever_chain)
        response = conversation_rag_chain.invoke(
            {"chat_history": chat_history, "input": user_message}
        )

        chat_history.append(user_message)
        ai_message = AIMessage(content=response["answer"])
        chat_history.append(ai_message)

        return response["answer"]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_context_retriever_chain(vector_store):
    llm = ChatOpenAI()
    retriever = vector_store.as_retriever()
    prompt = ChatPromptTemplate.from_messages(
        [
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
            (
                "user",
                "Given the above conversation, generate a search query to look up in order to get information relevant to the conversation",
            ),
        ]
    )

    retriever_chain = create_history_aware_retriever(llm, retriever, prompt)

    return retriever_chain

def get_conversational_rag_chain(retriever_chain):
    llm = ChatOpenAI()
    prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "Answer the user's questions based on the below context:\n\n{context}",
            ),
            MessagesPlaceholder(variable_name="chat_history"),
            ("user", "{input}"),
        ]
    )

    stuff_documents_chain = create_stuff_documents_chain(llm, prompt)

    return create_retrieval_chain(retriever_chain, stuff_documents_chain)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
