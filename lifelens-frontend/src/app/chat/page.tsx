"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Send,
  Plus,
  Menu,
  User,
  Bot,
  Copy,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Paperclip,
  X,
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  File as FileIcon,
  AlertTriangle,
  CheckCircle2,
  Loader2,
} from "lucide-react";

// ================= helpers / types =================
function uid() {
  if (typeof crypto !== "undefined" && (crypto as any).randomUUID)
    return (crypto as any).randomUUID();
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// Point this to your FastAPI origin. You can also set NEXT_PUBLIC_API_BASE in .env.local
const API_BASE =
  (process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000").replace(/\/$/, "");

// Backend response for each saved file
interface SavedFile {
  filename: string;
  path: string;
}

// Frontend file info used for UI
interface FileInfo {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string;
}

interface Message {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
  files?: FileInfo[];
}

export default function ChatFrontend() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<FileInfo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastServerEcho, setLastServerEcho] = useState<{
    message?: string;
    files?: SavedFile[];
  } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMessages([
      {
        id: uid(),
        type: "assistant",
        content:
          "Hello! I'm your assistant. Type a message, attach files if you want, and I'll send everything to the FastAPI backend.",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getFileIcon = (fileType = "") => {
    const t = fileType.toLowerCase();
    if (t.startsWith("image/")) return <ImageIcon size={16} className="text-blue-600" />;
    if (t.includes("pdf")) return <FileText size={16} className="text-red-600" />;
    if (t.includes("sheet") || t.includes("excel") || t.includes("csv"))
      return <FileSpreadsheet size={16} className="text-green-600" />;
    if (t.includes("document") || t.includes("word") || t.includes("doc"))
      return <FileText size={16} className="text-blue-800" />;
    return <FileIcon size={16} className="text-gray-600" />;
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"]; 
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const value = bytes / Math.pow(k, i);
    return `${Number(value.toFixed(2))} ${sizes[i]}`;
  };

  const handleFileSelect: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter((file) => file.size <= 10 * 1024 * 1024); // 10MB

    const newFiles: FileInfo[] = validFiles.map((file) => ({
      id: uid(),
      file,
      name: file.name,
      size: file.size,
      type: file.type || "",
    }));

    setAttachedFiles((prev) => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (fileId: string) => {
    setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId));
  };

  // === Core: send text + optional files to FastAPI ===
  const sendToBackend = async (text: string, files: FileInfo[]) => {
    const formData = new FormData();
    formData.append("message", text); // required by your FastAPI endpoint
    for (const f of files) {
      if (f.file) formData.append("files", f.file);
    }

    const res = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData, // Do NOT set Content-Type; browser sets proper boundary
      // credentials not needed for localhost unless cookies are used
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Upload failed (${res.status}): ${text || res.statusText}`);
    }

    const data: { message: string; files: SavedFile[] } = await res.json();
    return data;
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    setError(null);
    setUploading(true);

    // Optimistic UI: push user message first
    const optimisticFiles: FileInfo[] = attachedFiles.map((f) => ({ ...f }));

    const userMessage: Message = {
      id: uid(),
      type: "user",
      content: inputValue.trim() || (attachedFiles.length > 0 ? "Shared files" : "(empty)")
        ,
      files: optimisticFiles,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setAttachedFiles([]);

    try {
      const result = await sendToBackend(userMessage.content, optimisticFiles);
      setLastServerEcho(result);

      // Demo assistant reply showing what backend echoed
      const filesSummary =
        (result.files && result.files.length > 0)
          ? `I saved ${result.files.length} file(s):\n` +
            result.files.map((f) => `• ${f.filename} → ${f.path}`).join("\n")
          : "No files attached.";

      const assistantMessage: Message = {
        id: uid(),
        type: "assistant",
        content: `Server stored your message: "${result.message}"\n${filesSummary}`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Upload failed");
      const assistantMessage: Message = {
        id: uid(),
        type: "assistant",
        content:
          "Hmm, I couldn't reach the backend. Check the FastAPI server, CORS config, and API_BASE.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setUploading(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const copyToClipboard = async (content: string) => {
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(content);
      else window.prompt("Copy to clipboard: Ctrl+C, Enter", content);
    } catch {}
  };

  const formatTime = (timestamp?: Date) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const hours = date.getHours().toString().padStart(2, "0");
    const minutes = date.getMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b border-gray-700">
            <h1 className="text-white font-semibold text-lg">LifeLens</h1>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
              ×
            </button>
          </div>

          <div className="p-4">
            <button
              onClick={() => setMessages([])}
              className="w-full flex items-center gap-3 px-3 py-2 text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Plus size={16} />
              New chat
            </button>
          </div>

          <div className="flex-1 p-4 space-y-2">
            <div className="text-gray-400 text-xs uppercase font-medium mb-2">Recent</div>
            {["API Integration", "File Upload Test", "CSV Analysis", "PDF Q&A"].map((chat, i) => (
              <button key={i} className="w-full text-left px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg text-sm truncate transition-colors">
                {chat}
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-gray-700">
            <div className="flex items-center gap-2 text-gray-300">
              <User size={16} />
              <span className="text-sm">User Account</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-600 hover:text-gray-900">
            <Menu size={20} />
          </button>
          <h2 className="font-medium text-gray-900">Chat Header</h2>
          <div className="w-10" />
        </header>

        {error && (
          <div className="px-4 py-2 bg-red-50 border-b border-red-200 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {lastServerEcho && (
          <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
            <CheckCircle2 size={16} />
            <span>Backend received: "{lastServerEcho.message}" ({lastServerEcho.files?.length || 0} file(s)).</span>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6">
            {messages.map((message) => (
              <div key={message.id} className={`mb-6 flex gap-4 ${message.type === "user" ? "flex-row-reverse" : ""}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${message.type === "user" ? "bg-green-600" : "bg-purple-600"}`}>
                  {message.type === "user" ? <User size={16} /> : <Bot size={16} />}
                </div>

                <div className={`flex-1 max-w-2xl ${message.type === "user" ? "text-right" : ""}`}>
                  <div className={`inline-block p-4 rounded-2xl ${message.type === "user" ? "bg-blue-600 text-white" : "bg-white border border-gray-200 text-gray-900"}`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>

                    {message.files && message.files.length > 0 && (
                      <div className={`mt-3 space-y-2 ${message.type === "user" ? "" : "border-t pt-3"}`}>
                        {message.files.map((fileInfo) => (
                          <div key={fileInfo.id} className={`flex items-center gap-2 p-2 rounded-lg ${message.type === "user" ? "bg-blue-500 bg-opacity-20" : "bg-gray-50"}`}>
                            {getFileIcon(fileInfo.type)}
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium truncate ${message.type === "user" ? "text-blue-100" : "text-gray-700"}`}>{fileInfo.name}</div>
                              <div className={`text-xs ${message.type === "user" ? "text-blue-200" : "text-gray-500"}`}>{formatFileSize(fileInfo.size)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className={`mt-2 flex items-center gap-2 text-xs text-gray-500 ${message.type === "user" ? "justify-end" : ""}`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.type === "assistant" && (
                      <div className="flex gap-1">
                        <button onClick={() => copyToClipboard(message.content)} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Copy">
                          <Copy size={14} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Good response">
                          <ThumbsUp size={14} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Bad response">
                          <ThumbsDown size={14} />
                        </button>
                        <button className="p-1 hover:bg-gray-100 rounded transition-colors" title="Regenerate">
                          <RotateCcw size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="mb-6 flex gap-4">
                <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white">
                  <Bot size={16} />
                </div>
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Composer */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="max-w-3xl mx-auto">
            {attachedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {attachedFiles.map((fileInfo) => (
                  <div key={fileInfo.id} className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    {getFileIcon(fileInfo.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-700 truncate">{fileInfo.name}</div>
                      <div className="text-xs text-gray-500">{formatFileSize(fileInfo.size)}</div>
                    </div>
                    <button onClick={() => removeFile(fileInfo.id)} className="p-1 hover:bg-gray-200 rounded transition-colors" title="Remove file">
                      <X size={14} className="text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="relative">
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message…"
                className="w-full px-4 py-3 pr-28 border border-gray-300 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent max-h-32"
                rows={1}
                style={{ minHeight: "48px" }}
              />

              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1 items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={handleFileSelect}
                  accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.xls,.ppt,.pptx,.jpg,.jpeg,.png,.gif,.bmp,.webp,.mp4,.mp3,.wav"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  title="Attach files"
                  disabled={uploading}
                >
                  <Paperclip size={16} />
                </button>

                <button
                  onClick={handleSendMessage}
                  disabled={( !inputValue.trim() && attachedFiles.length === 0 ) || uploading}
                  className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
                >
                  {uploading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  {uploading ? "Sending" : "Send"}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-500 mt-2 text-center">
              Sends your text as <code>message</code> and attached files as <code>files</code> (multipart/form-data) to {API_BASE}/upload
            </p>
          </div>
        </div>
      </div>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  );
}
