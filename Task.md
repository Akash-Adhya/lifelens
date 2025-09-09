## 8-Week Roadmap (MVP to Production)

A practical, time-boxed plan for building an interview-ready MVP in 1–2 months, with optional advanced features in weeks 9–12. Each week includes objectives, tasks, deliverables, and acceptance criteria.

---

### Week 1 — Project Setup & Planning

- **Objective:** Define MVP scope and set up repo/infrastructure.
- **Tasks:**
  - Finalize MVP features: file upload (PDF/image/audio/table), doc Q&A, summarization, search, chat UI.
  - Create repo with frontend/backend skeletons, README, license, issue tracker.
  - Design architecture diagram (frontend, API, worker, DB, vector DB).
  - Select Hugging Face models/pipelines for MVP.
  - Setup environment management (.env.example, GitHub repo, branches).
- **Deliverables:** Repo, architecture doc, tech stack list, project board.
- **Acceptance:** Can run npm start and uvicorn locally; CI skeleton present.

#### Done week 1, except Design architecture

- on 10 september 2025

---

### Week 2 — File Upload & Ingestion

- **Objective:** Build file upload UI and backend ingestion pipeline.
- **Tasks:**
  - Frontend: upload component (FilePond/Uppy) with preview and mime-type detection.
  - Backend: /upload endpoint to accept files, store (S3/local), return file_id.
  - Preprocessing: PDF (extract text/images), Images (OCR/image-to-text), Audio (ASR), CSV/Excel (table parser).
  - Store raw and extracted text in DB with metadata.
- **Deliverable:** End-to-end upload flow with parsed text.
- **Acceptance:** Uploading a PDF returns text; frontend shows preview.

### Week 3 — Core AI Pipelines & Orchestration

- **Objective:** Integrate Hugging Face models and orchestrate processing.
- **Tasks:**
  - Implement pipeline_orchestrator(file_id) to detect content type and run appropriate models.
  - Chain steps (e.g., OCR → chunk → summarization → embeddings).
  - Integrate LangChain or simple orchestrator.
  - Save LLM outputs and embeddings for semantic search.
- **Deliverable:** Processed document outputs (summary, QA chunks, embeddings).
- **Acceptance:** API returns summary and vector index for a PDF.

### Week 4 — Chat/Q&A & Semantic Search

- **Objective:** Build chat interface for Q&A on uploaded content.
- **Tasks:**
  - Frontend chat UI with context and file selector.
  - Backend /qa endpoint: retrieve top-k chunks by embedding, call LLM, return answer with citations.
  - Implement source highlight (link answers to document pages/timestamps).
- **Deliverable:** Chat UI answers questions with citations.
- **Acceptance:** Accurate answers with page references.

### Week 5 — Table QA & Analytics Dashboard

- **Objective:** Support table question answering and analytics.
- **Tasks:**
  - Table QA pipeline (table → HF table-QA model).
  - Dashboard page: breakdowns, charts (Chart.js/Recharts).
  - Backend endpoints for summaries and aggregations.
- **Deliverable:** Upload CSV, get category summary and charts.
- **Acceptance:** Table queries return correct values and charts.

### Week 6 — Async Processing & Scalability

- **Objective:** Add background processing and caching.
- **Tasks:**
  - Task queue (Celery + Redis/RQ) for heavy jobs.
  - Redis caching for repeated queries/results.
  - Rate limiting and throttling.
- **Deliverable:** Jobs run in background; progress indicators in frontend.
- **Acceptance:** Long jobs show status until complete.

### Week 7 — Security, Privacy & Deployment Prep

- **Objective:** Harden app for users and demos.
- **Tasks:**
  - Add user accounts (Auth0/JWT or simple email auth).
  - PII handling: redact/delete docs, encryption at rest.
  - Logging and monitoring (Sentry).
  - Prepare staging deployments (Vercel, Render/Fly).
- **Deliverable:** Auth flow, privacy docs, staging deployed.
- **Acceptance:** User can sign up, upload, and delete docs.

### Week 8 — Polish, Docs, Demo & Release

- **Objective:** Final polish, documentation, and demo.
- **Tasks:**
  - Write README with features, architecture, setup.
  - Record short demo video (2–3 mins).
  - Create production deployment and demo account.
  - Add integration tests and finalize CI.
  - Prepare resume/LinkedIn bullets and project page.
- **Deliverable:** Live demo, README, demo video, resume bullet.
- **Acceptance:** Demo runs in production; README is reproducible.

### Weeks 9–12 (Optional Advanced Features)

- Multimodal cross-document search
- Fine-tune models for domain-specific tasks
- Voice-based chat (diarization + ASR)
- Role-based access and team collaboration
- Cost optimization: batch embeddings, model selection

### Models/Tasks Mapping

- Document QA: HF deepset/roberta-base-squad2, RAG with sentence-transformers
- Image-to-Text: OCR + captioning (layoutlm, donut)
- Summarization: bart-large-cnn, pegasus, or LLM completion
- Audio-to-Text: whisper, wav2vec
- Table QA: tapas, prompt-aware LLM
- Zero-Shot Classification: bart-large-mnli, sentence-transformers
- Embeddings: sentence-transformers for Chroma/Weaviate/FAISS

### Real-World APIs & Data Sources

- Google Drive/Dropbox/OneDrive (docs)
- Gmail (attachments, with permission)
- Plaid/Open Banking APIs, sample CSVs
- YouTube/Zoom (meeting transcription)
- Public datasets: arXiv PDFs, Kaggle finance

### Architecture & Scaling Notes

- Microservices: FastAPI API, Celery worker, Chroma vector store, S3 storage
- Async endpoints for responsiveness; heavy jobs offloaded
- Cache embeddings/model outputs
- Model fallback: local for cheap ops, cloud LLM for final answers

### Resume/Interview Bullets & Metrics

- "Designed and deployed LifeLens, a multimodal assistant supporting PDF/image/audio/CSV ingestion, semantic search, and document Q&A using Hugging Face pipelines. Implemented async processing and vector search for sub-second queries."
- "Built end-to-end table QA and audio transcription; reduced query latency by 40% via caching and background workers."
- "Integrated real-world APIs, PII deletion, role-based auth, and deployed on Vercel + Render."

### Quick Demo Script (2 mins)

- 0:00–0:20 — Upload a research PDF (show UI)
- 0:20–0:50 — Show summary; ask a question; show answer with citation
- 0:50–1:20 — Upload bank CSV; show dashboard and table QA
- 1:20–1:50 — Upload whiteboard photo; extract, summarize, add to vault
- 1:50–2:00 — Note deployment link and GitHub source
