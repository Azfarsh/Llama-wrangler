# Axel AI: An Agentic LLM-Based System for Automated Data Wrangling and Excel Intelligence

**Radhika Uplanchiwar¹, Azfar Shaikh², Sohel Sayyed³, Prasad Bhagyawant⁴, Prof. S.L. Dawkhar⁵**

¹²³⁴⁵ Department of Information Technology, Sinhgad College of Engineering, Pune — 41

---

## Abstract

Data wrangling is a critical yet time-consuming phase in data science, often consuming up to **70–80%** of total effort. Existing tools require significant technical expertise and lack intelligent automation. This paper presents **Axel AI**, an agentic AI-based system that automates the data wrangling pipeline using natural language interaction.

The system integrates **Google Gemini** with a multi-agent architecture consisting of intent understanding, transformation planning, safe execution, and validation. It **separates LLM reasoning from deterministic Python (pandas) execution** to improve reproducibility and reduce the risk of hallucinated data edits. The system also supports **Excel intelligence**: formula assistance, chart creation, and dashboard-oriented workbook updates via natural language.

A **lightweight Retrieval-Augmented Generation (RAG)** module augments prompts using **dataset-profile text chunks** retrieved with **in-memory, lexical token-overlap scoring** (no external vector database). **Rule-based Feature Type Inference (FTI)** assigns each column one of **twelve** types aligned with the AutoDW family of features.

The current work is implemented as a **full-stack academic prototype** (FastAPI backend, React 19 frontend). **Quantitative claims** (e.g., fixed percentage speedups) should only be stated after a defined benchmark protocol, datasets, and baselines; until then, evaluation should be described qualitatively (workflow automation, transparency via generated scripts, and separation of planning from execution).

**Keywords:** Data Wrangling, Large Language Models, Agentic AI, Google Gemini, Feature Type Inference, Retrieval-Augmented Generation, Excel AI, React, FastAPI, Automated Data Preprocessing

---

## 1. INTRODUCTION

### 1.1 Background

Data is a central asset in modern organizations. Raw data is often inconsistent and incomplete; before analysis or machine learning, it must be cleaned and transformed—a process known as **data wrangling** or preprocessing.

Wrangling includes handling missing values, removing duplicates, encoding categoricals, normalizing numerics, and extracting datetime features. These tasks typically require expertise in Python, R, or SQL. Industry commentary often cites that data professionals spend a large share of time on preparation rather than analysis.

Tools such as Microsoft Excel, Trifacta, and OpenRefine provide partial automation but still demand substantial manual effort. Few mainstream tools expose a **natural language** interface for end-to-end wrangling, which limits participation by non-programming domain users.

Large Language Models (LLMs) can interpret goals in natural language and propose structured transformation plans. **Axel AI** uses this capability in a **multi-agent** design powered by **Google Gemini**, with **four** logical stages: Intent Understanding, Transformation Planning, Safe Execution, and Validation (including insight generation).

### 1.2 Motivation

Technical users still spend heavy time on repetitive preprocessing; non-technical users often cannot contribute without developer support. Axel AI combines **conversational** specification with a **deterministic execution** path: the LLM proposes plans and explanations; **validated pandas operations and sandboxed execution of generated code** apply changes to real data frames, reducing uncontrolled LLM “direct editing” of values.

### 1.3 Problem Statement

Preparation remains labor-intensive and skill-dependent. Some AI-assisted designs let models manipulate data opaquely, which can produce incorrect or inconsistent results. Axel AI targets a **natural-language wrangling workflow** with **Excel AI**, **session-level continuity**, and **downloadable Python scripts**, while keeping **LLM reasoning separate from execution** where possible.

### 1.4 Objectives

1. Implement a **multi-agent** pipeline for end-to-end wrangling with minimal manual coding by the user.  
2. Enable **natural language** transformation requests for tabular (CSV/Excel) data.  
3. Provide an **Excel AI Assistant** for formulas, charts, and dashboard-style workbook changes from plain English.  
4. Provide **auto-wrangling** mode: target-column prediction, **FTI**, plan generation, and execution with minimal user input.  
5. Integrate **RAG** for **dataset-specific** prompt context using **profile-derived chunks** and **lexical retrieval**.  
6. Implement **rule-based FTI** with **twelve** column types (subset aligned with AutoDW-style typing).  
7. Support **reproducibility** via **Jinja2**-templated **downloadable Python** scripts.  
8. Deliver a **responsive full-stack** web app: **React 19**, **Vite 7**, **Tailwind CSS**, **FastAPI** backend.  
9. **Extend and validate in prototype form** the ideas in **AutoDW (ASE 2024)** with conversational UI, Gemini, lightweight RAG, and Excel AI—positioned as a **research prototype**, not a production enterprise deployment.

### 1.5 Brief Description

Axel AI is a **full-stack**, **multi-agent** system: users upload **CSV or Excel**, describe goals in **plain English**, and receive processed files plus optional scripts.

The **backend** uses **Python** and **FastAPI**. **Gemini** drives **intent analysis**, **JSON plan generation**, and **insights**; **pandas**, **NumPy**, and **scikit-learn** perform operations. **LLM-generated code** runs in a **restricted execution** path intended to limit unsafe behavior.

**RAG** builds short **text chunks** from the **dataset profile** (columns, dtypes, missing counts, sample row, etc.), stores them **in memory** for the session, and **scores** chunks against the user query with **token overlap**; the top chunks are **prepended to prompts** for intent and planning (and related flows)—this is **not** embedding-based vector search.

**FTI** assigns one of **twelve** types: numerical, categorical, datetime, sentence, url, embedded_number, list, ignorable_id, unit, sign, range, formatted_id.

The **frontend** provides a **chat-style** flow for wrangling, dashboard-style pages for upload and download, and **Plotly**-based visualization where figures are returned from the API. **Authentication** in the prototype is **client-side (browser storage)** for demonstration; there is **no** production user database in the described codebase.

The work is **inspired by** and **compares to** **AutoDW: Automatic Data Wrangling Leveraging Large Language Models** (ASE, 2024). **AutoDW** is the ASE paper title; **Axel AI** is **this team’s implementation name**.

---

## 2. LITERATURE SURVEY

**[1] AutoDW (ASE, 2024)** — Liu et al. present an automated wrangling approach using LLMs, including feature type inference, cleaning, and code generation. The reference system is not described as a conversational web product with Excel AI or the specific lightweight RAG used here.

**[2] GPT-4 Technical Report** (Achiam et al., 2023) — Demonstrates strong reasoning and code generation; not specialized for tabular wrangling; hallucination remains a risk without controlled execution.

**[3] Data Cleaning: Overview and Emerging Challenges** (Chu et al., SIGMOD, 2016) — Classic survey of cleaning methods; often manual or rule-heavy for non-experts.

**[4] AutoML to Date and Beyond** (Karmaker et al., CSUR, 2021) — Focuses on model automation; limited emphasis on conversational wrangling.

**[5] Survey on Large Language Models** (Hadi et al., 2023) — Discusses LLM limitations (hallucination, cost), motivating **separation of planning and execution**.

**Note for authors:** Items **[6]** and **[7]** in some drafts cite vague “Elsevier 2022” / “Springer 2024” titles without stable DOIs. For submission, **replace with peer-reviewed sources you have actually read**, or **remove** those entries. Do not invent references.

---

## 3. OVERVIEW

### 3.1 Objective

Develop an intelligent wrangling assistant that: interprets **natural language**; uses a **multi-agent** decomposition; runs **deterministic** transforms; emits **insights**; supports **Excel AI**; and exports **reproducible scripts**.

### 3.2 Core Components

- **Intent Understanding** — Gemini interprets the user message (with optional RAG context).  
- **Transformation Planning** — Structured plan (e.g., JSON) of steps.  
- **Feature Type Inference** — Twelve-type rule-based classification.  
- **Safe Execution** — Predefined operations plus **sandboxed** execution paths for generated code.  
- **Validation and Insights** — Profile comparison and narrative or structured insights.  
- **Excel AI Module** — openpyxl-based workbook edits, charts, optional dashboard sheet creation.  
- **Code Generator** — Jinja2 templates for downloadable Python.  
- **RAG Module** — Profile chunking + **token-overlap** retrieval in memory.

### 3.3 Working Principle

1. User uploads **CSV/Excel** and enters a **natural language** goal.  
2. System **profiles** the dataset and **indexes** RAG chunks.  
3. **Intent** and **plan** are produced with **Gemini** (augmented by RAG where used).  
4. **FTI** informs planning and execution.  
5. **Execution** updates a **pandas** `DataFrame` (and optional **Excel** sheets).  
6. **Validation/insights** summarize changes.  
7. User **downloads** the processed file and may download a **.py** script.

### 3.4 Accessibility and Innovation

End-to-end assistance, **LLM + deterministic execution**, **conversational UI**, **Excel AI**, **script export**, **lightweight RAG** without third-party vector stores.

### 3.5 Limitations (Prototype)

- **Session state** and RAG index are **in-memory** on the server (typical of course/research prototypes).  
- **User accounts** are not backed by a secure server-side auth service in the described implementation.  
- **RAG** is **lexical**, not semantic embedding search.

### 3.6 Social Impact

(Same intent as your original section—keep claims **qualitative** unless you add a measurement study.)

---

## 4. METHODOLOGY

### A. Existing Systems

Manual Excel/Python/SQL workflows dominate; many steps lack NL interfaces; risky designs let LLMs edit data without a clear execution boundary.

### B. Conceptual Design

**Axel AI** accepts **CSV/Excel**, accepts **NL** instructions, uses **Gemini** for understanding and planning, and **pandas** for execution. **RAG** injects **profile-derived** lines into prompts via **token-overlap** retrieval.

### C. Prototype Design

Four agents: **Intent**, **Planning**, **Safe Execution**, **Validation/Insights**; plus **FTI** and **code generation**.

### D. System Architecture

Layers: **Input** → **Profiling** → **RAG (in-memory profile chunks)** → **Intent (Gemini)** → **Planning** → **Execution (pandas)** → **Validation** → **Output** → **UI (React)**.

*(Replace “Fig 1” with your diagram; fix any typo “Gemi ni” → **Gemini**.)*

### E. Model Design and Validation

Gemini for high-level reasoning; execution on actual data structures; FTI with twelve types; validation via profiling, logs, and insight generation.

### F. User Interface

React 19, Vite 7, Tailwind CSS; chat and dashboard pages; Plotly for API-driven charts where applicable.

### G. Implementation Details

| Component | Technology |
|-----------|------------|
| Backend | Python, FastAPI |
| Frontend | React 19, Vite 7, Tailwind CSS, Axios |
| Visualization (UI) | Plotly (`react-plotly.js`) |
| Data | pandas, NumPy, scikit-learn |
| LLM | Google Gemini API (configurable; e.g. `gemini-2.5-flash`) |
| Excel | openpyxl |
| Templates | Jinja2 |

API title in code may appear as **AutoDW-Lite**; product branding in the UI is **Axel AI**.

### H. Performance Evaluation

Describe **what** you measure (time to first result, number of manual steps removed, success on sample datasets, error rates). **Avoid** specific **percentage** improvements until you document **datasets, hardware, baselines, and repeated trials**.

---

## 5. APPLICATIONS

Analytics, BI, education, research preprocessing, ETL assistance, Excel-heavy workflows—as in your original section, stated at appropriate generality.

---

## 6. CONCLUSION AND FUTURE SCOPE

Axel AI combines **Gemini**-based **planning** with **pandas**-based **execution**, **twelve-type FTI**, **lightweight profile RAG**, **Excel AI**, and **script export** in a **full-stack prototype**. Future work may include **embedding-based (vector) RAG**, **persistent/cloud** storage, **multi-dataset** sessions, **collaboration**, and **stronger security and authentication** for production use.

---

## 7. REFERENCES

1. Lei Liu, So Hasegawa, Shailaja Keyur Sampat, Maria Xenochristou, Wei-Peng Chen, “AutoDW: Automatic Data Wrangling Leveraging Large Language Models,” *Proc. IEEE/ACM International Conference on Automated Software Engineering (ASE)*, 2024.

2. Josh Achiam et al., “GPT-4 Technical Report,” *arXiv:2303.08774*, 2023.

3. Xu Chu, Ihab F. Ilyas, Sanjay Krishnan, Jiannan Wang, “Data Cleaning: Overview and Emerging Challenges,” *Proc. ACM SIGMOD*, 2016.

4. M. U. Hadi et al., “A Survey on Large Language Models: Applications, Challenges, Limitations, and Practical Usage,” *Authorea Preprints*, 2023.

5. Y.-W. Chen, Q. Song, X. Hu, “Techniques for Automated Machine Learning,” *ACM SIGKDD Explorations Newsletter*, 2021.

6. S. K. Karmaker et al., “AutoML to Date and Beyond: Challenges and Opportunities,” *ACM Computing Surveys (CSUR)*, 2021.

7. Tom B. Brown et al., “Language Models are Few-Shot Learners,” *Advances in Neural Information Processing Systems (NeurIPS)*, 2020.  
   *(Your PDF listed “Guo et al.” for this title—that is incorrect; use Brown et al. for GPT-3.)*

8. X. He, K. Zhao, X. Chu, “AutoML: A Survey of the State-of-the-Art,” *Knowledge-Based Systems*, 2021.

9. Google AI, “Gemini API Documentation,” Google for Developers. https://ai.google.dev (see also https://aistudio.google.com for API keys.)

---

*End of corrected draft. Copy into Word, re-apply your figures (Fig 1–3), and export to PDF.*
