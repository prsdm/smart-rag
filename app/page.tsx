"use client";

import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { LoaderComponent } from "@/components/loader";
import { PanelLeft } from "lucide-react";
import { FaGithub } from "react-icons/fa";
import { SiHuggingface } from "react-icons/si";
import { FaSquareXTwitter } from "react-icons/fa6";
import { BsMedium } from "react-icons/bs";
import { GiWorld } from "react-icons/gi";

interface Message {
  role: "user" | "bot";
  content: string;
}

const ConversationPage: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isScraping, setIsScraping] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [input, setInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [urlResponse, setUrlResponse] = useState("");
  const [docResponse, setDocResponse] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [, setFileKey] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const chatParent = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const domNode = chatParent.current;
    if (domNode) {
      domNode.scrollTop = domNode.scrollHeight;
    }
  }, [messages]);

  const handleScrapeSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsScraping(true);
    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: urlInput }),
      });

      const json = await response.json();
      setUrlResponse("URL successfully processed. ");
    } catch (error) {
      console.error("Error scraping URL: ", error);
      setUrlResponse("Failed to process URL.");
    }
    setIsScraping(false);
  };

  const handleDocumentUpload = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!file) {
      alert("Please select a file to upload.");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/upload_document", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFileKey(response.data.file_key);
      setDocResponse("Document successfully uploaded.");
    } catch (error) {
      console.error("Error uploading document: ", error);
      setDocResponse("Failed to upload document.");
    }
    setIsUploading(false);
  };

  const handleChatSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessages((prevMessages) => [
      { role: "user", content: input },
      ...prevMessages,
    ]);

    setIsLoading(true);
    try {
      const response = await axios.post("/api/chat", { message: input });
      setMessages((prevMessages) => [
        { role: "bot", content: response.data },
        ...prevMessages,
      ]);
    } catch (error) {
      console.error("Error in chat: ", error);
    }
    setIsLoading(false);
    setInput("");
  };

  return (
    <div className="flex h-screen">
      
      {/* Sidebar */}
      {isSidebarOpen && (
        <aside className={`fixed sm:relative top-0 left-0 w-full sm:w-1/4 h-full p-4 bg-muted border-r sm:static z-20 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="absolute top-4 right-4 p-2 text-blue-500 bg-white rounded-full"
          >
            <PanelLeft />
          </button>
          <div className="flex text-lg font-bold mt-2 mb-4">
          Website
          </div>
          <form
            onSubmit={handleScrapeSubmit}
            className="flex flex-col gap-4 mb-4"
          >
            <Input
              placeholder="Enter URL to scrape"
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
            />
            <Button type="submit">Scrape Website</Button>
            {isScraping && <LoaderComponent />}
            {urlResponse && <p>{urlResponse}</p>}
          </form>
          <div className="flex text-lg font-bold mt-10 mb-4">
          Document
          </div>
          <form onSubmit={handleDocumentUpload} className="flex flex-col gap-4">
            <Input
              type="file"
              onChange={(e) =>
                setFile(e.target.files ? e.target.files[0] : null)
              }
            />
            <Button type="submit">Upload Document</Button>
            {isUploading && <LoaderComponent />}
            {docResponse && <p>{docResponse}</p>}
          </form>
          <div className="flex justify-center gap-2 mt-40">
      <a href="https://prsdm.github.io/" target="_blank" rel="noopener noreferrer">
        <GiWorld className="h-6 w-6" />
      </a>
      <a href="https://github.com/prsdm" target="_blank" rel="noopener noreferrer">
        <FaGithub className="h-6 w-6" />
      </a>
      <a href="https://medium.com/@prasadmahamulkar" target="_blank" rel="noopener noreferrer">
        <BsMedium className="h-6 w-6" />
      </a>
      <a href="https://huggingface.co/prsdm" target="_blank" rel="noopener noreferrer">
        <SiHuggingface className="h-6 w-6" />
      </a>
    </div>
          <div className="text-sm text-center mt-1">Created by Prasad Mahamulkar</div>
        </aside>
      )}

      {/* Sidebar Toggle Button */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 left-4 z-10 p-2 bg-blue-500 text-white rounded-full"
        >
          <PanelLeft />
        </button>
      )}

     
      {/* Header content*/}
      <main className={`flex-1 p-4 max-w-3xl mx-auto flex flex-col ${isSidebarOpen ? "ml-64" : ""}`}>
        <header className="p-1 w-full mx-auto">
          <h1 className="text-2xl font-bold text-center">Smart RAG</h1>
          <div className="absolute right-4 top-4 flex gap-4">
            <a
              href="https://github.com/prsdm/smart-rag-fastapi"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center"
            >
              <FaGithub className="h-6 w-6 text-black" />
            </a> 
          </div>
        </header>

        
        {/* Chat part */}
        <section className="container px-0 pb-1 flex flex-col flex-grow gap-4 mx-auto max-w-3xl">
          <ul
            ref={chatParent}
            className="h-1 p-4 flex-grow overflow-y-auto flex flex-col-reverse gap-4"
          >
            {messages.map((m, index) => (
              <li
                key={index}
                className={`flex ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                <div
                  className={`rounded-xl p-4 shadow-md flex ${m.role === "user" ? "bg-gray" : "bg-green"}`}
                >
                  <p className="text-primary">{m.content}</p>
                </div>
              </li>
            ))}
          </ul>
          {isLoading && (
            <div>
              <LoaderComponent />
            </div>
          )}
          <form onSubmit={handleChatSubmit} className="flex gap-2 p-4">
            <Input
              placeholder="Type your message here..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <Button type="submit">Send</Button>
          </form>
        </section>
        <div className="flex justify-center text-sm"> 
        SmartRAG can increase your productivity by 10x.
        </div>
      </main>
    </div>
  );
};

export default ConversationPage;
