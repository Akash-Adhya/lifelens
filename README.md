# LifeLens: AI-Powered Multimodal Personal Knowledge & Decision Assistant

## Overview

LifeLens is a personal assistant that ingests any type of content—documents, images, videos, or audio—and provides context-aware, actionable insights.

### Example Use Cases
- Student uploads lecture slides (PDF/images) and audio → receives summarized notes and quiz questions.
- Traveler uploads receipt photos and itinerary → receives expense breakdown and travel tips.
- Small business owner uploads sales spreadsheets and product images → receives sales analysis and marketing suggestions.
- Researcher uploads a research paper PDF → receives visual summaries, key facts, and related work suggestions.

### Problem Solved

Most data is scattered across formats (text, images, audio, tables). Existing tools only handle one format, requiring multiple apps and manual effort.

LifeLens solves this by:
- Accepting any content type
- Automatically processing with the correct AI pipeline
- Returning actionable summaries, recommendations, or Q&A
- Providing an interactive chat to explore insights

### Hugging Face Tasks Used
- Document Question Answering: Chat with PDFs/images
- Image-to-Text: Caption images for LLMs
- Text Summarization: Condense large texts
- Table Question Answering: Analyze CSV/XLS tables
- Audio-to-Text (ASR): Convert audio to searchable notes
- Visual Document Retrieval (optional): Search stored docs
- Zero-Shot Classification: Categorize unknown inputs

### Tech Stack

**Frontend:**
- Next.js (React)
- TailwindCSS
- React Query
- FilePond / Uppy

**Backend:**
- Python + FastAPI
- Hugging Face Transformers & Pipelines
- LangChain
- Pandas
- ffmpeg-python

**Database:**
- PostgreSQL
- Redis
- Optional: Weaviate / ChromaDB

**Deployment:**
- Backend: Render/Fly.io
- Frontend: Vercel
- Storage: AWS S3 / Supabase Storage

### Key Features
- Smart File Detection: Detects file type and routes to correct model
- Multimodal Processing: Combines outputs from different formats
- Unified Search & Q&A: Search across all processed files
- Interactive Chat: Ask questions about uploaded content
- Scalable Microservices: Modular pipelines for each data type
- Personal Knowledge Vault: Stores embeddings for instant recall

### Resume Impact

**Impact Statement:**
Designed and deployed LifeLens, a multimodal AI web platform integrating Hugging Face’s document QA, image captioning, table QA, and speech-to-text pipelines. Enabled real-time analysis and Q&A across text, images, PDFs, and audio. Architected scalable FastAPI microservices with async processing, reducing query latency by 40% and supporting concurrent multimodal tasks.

**Portfolio Value:**
- Demonstrates full-stack skills (Next.js + FastAPI)
- Shows AI integration with multiple Hugging Face tasks
- Highlights scalability (microservices, caching, async)
- Proves UX thinking (single interface for all content types)
- Practical for enterprise doc analysis, customer support, research tools, etc.