"use client";
import React, { useState } from "react";

export default function Home() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{ filename: string; filepath: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadResult(null);
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    setError(null);
    setUploadResult(null);
    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      const res = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) throw new Error("Upload failed");
      const data = await res.json();
      setUploadResult(data);
      console.log("Upload response:", data);
    } catch (err: any) {
      setError("Upload failed");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-gray-300">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">LifeLens</h1>
      <p className="mb-4 text-gray-600">Upload an image for AI analysis</p>
      
      <input
        type="file"
        accept="image/*"
        className="mb-4"
        onChange={handleFileChange}
      />

      <button
        onClick={handleUpload}
        disabled={!selectedFile || uploading}
        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {uploading ? "Uploading..." : "Analyze"}
      </button>

      {uploadResult && (
        <div className="mt-4 text-green-600 text-center">
          Uploaded: <span className="font-mono">{uploadResult.filename}</span>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-600 text-center">{error}</div>
      )}
    </main>
  );
}
