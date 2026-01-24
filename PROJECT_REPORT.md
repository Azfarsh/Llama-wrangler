Below is a **clean, academic-grade project summary + implementation overview** that you can directly use for:

* final-year project proposal
* project report (aligned with **AutoDW research paper**)
* mentor / evaluator explanation
* startup / product pitch

It is written in **formal but clear language**, technically accurate, and consistent with **agentic AI + LLM data wrangling systems**.

---

# 📘 Project Title

**AutoDW-Lite: An Agentic AI System for Automatic Data Wrangling Using Large Language Models**

---

## 1️⃣ Project Summary (Research-Aligned)

Data wrangling is a critical yet time-consuming phase in data analytics and machine learning pipelines, often requiring manual intervention, technical expertise, and repeated trial-and-error using tools such as Excel, scripts, or SQL queries. According to recent research, data scientists spend up to 70–80% of their time preparing data rather than performing analysis.

Inspired by the **AutoDW research paper (ASE 2024)**, this project proposes **AutoDW-Lite**, an **agentic AI-based data wrangling system** that enables **non-technical users** to automatically clean, transform, and prepare datasets using **natural language instructions**.

The system adopts a **ChatGPT-style interaction model**, where users upload a dataset, preview its structure, and simply describe their requirement in plain English (e.g., *“prepare this dataset for machine learning”* or *“clean this data for dashboard usage”*). The backend AI agent understands the dataset, plans the required data wrangling operations, executes them autonomously, validates the results, and finally provides a **downloadable processed dataset** — without exposing any code to the user.

Unlike traditional rule-based tools, AutoDW-Lite integrates a **Large Language Model (Gemini)** for reasoning and decision-making, combined with deterministic data processing pipelines to ensure accuracy, safety, and reproducibility.

---

## 2️⃣ Research Foundation (AutoDW Paper Alignment)

This project is **directly aligned** with the AutoDW paper’s core contributions:

| AutoDW (ASE 2024)                   | This Project                           |
| ----------------------------------- | -------------------------------------- |
| End-to-end automation               | Fully automated data wrangling         |
| LLM-assisted planning               | Gemini-powered intent & planning agent |
| Feature type inference              | Rule-based + extensible feature typing |
| Separation of reasoning & execution | LLM plans, Python executes             |
| No-code usability                   | Non-technical, chat-based UI           |

However, unlike AutoDW (which generates source code), **this system deliberately hides code** and focuses on **output-only delivery**, making it more suitable for business users.

---

## 3️⃣ Core System Architecture (Agentic AI)

### High-Level Workflow

```
User Uploads Dataset
        ↓
Dataset Preview (Frontend)
        ↓
User Writes Natural Language Requirement
        ↓
LLM-Powered Intent Understanding Agent (Gemini)
        ↓
Planning Agent (Operation Strategy)
        ↓
Execution Agent (Data Cleaning & Transformation)
        ↓
Validation Agent (Quality Checks)
        ↓
Downloadable Clean Dataset
```

### Key Principle

> **LLM thinks, agent plans, code executes**

This ensures:

* No hallucinations
* Deterministic output
* Scalable performance on large datasets

---

## 4️⃣ LLM & Agent Design

### LLM Used

* **Google Gemini API**
* Used strictly for:

  * understanding user intent
  * planning data wrangling steps
  * reasoning over dataset metadata

### Not used for:

* editing raw data
* performing calculations
* modifying dataset rows directly

This design follows best practices suggested in the AutoDW paper and modern agentic AI systems.

---

## 5️⃣ Authentication & Storage Strategy

### Authentication (Frontend-only)

* **Login & Signup implemented using browser localStorage**
* No backend user database (for MVP simplicity)

Stored locally:

* user email
* hashed password (basic hashing)
* session state

Advantages:

* Fast
* No server-side auth complexity
* Suitable for academic / prototype use

⚠️ Clearly documented as **prototype-level authentication**, not production security.

---

## 6️⃣ Frontend Implementation (React – Day Theme)

### Technology

* React 18
* Tailwind CSS
* LocalStorage for auth
* Axios for API calls

### Design Style

* **Day / Light Theme**
* Modern, clean, minimal
* Large content sections
* Long scrolling homepage (startup-style)

---

## 7️⃣ Pages to Implement (Total Pages)

### 🔐 Authentication Pages (2)

1. **Login Page**

   * Email & password
   * LocalStorage-based session
2. **Signup Page**

   * Create account
   * Store credentials locally

---

### 🏠 Public Pages (4)

3. **Home Page (Long & Impressive)**

   * Hero section
   * Problem statement (manual data wrangling)
   * Solution overview
   * Agentic AI explanation
   * AutoDW research inspiration
   * Feature highlights
   * Call-to-action

4. **How It Works Page**

   * Step-by-step workflow
   * Diagrams / icons
   * Agent explanation

5. **About Project Page**

   * Research background
   * AutoDW paper reference
   * Technologies used
   * Academic relevance

6. **Contact / Info Page**

   * Project details
   * College / course info

---

### 🧠 Protected Pages (After Login) (3)

7. **Dashboard**

   * Upload dataset
   * Dataset preview
   * Chat-style input box

8. **Processing Page**

   * Shows agent working steps
   * Progress indicators

9. **Download Results Page**

   * Processed dataset download
   * Summary of operations performed

---

### ✅ Total Pages: **9 Pages**

This is an **ideal number** for a final-year project:
✔ Not too small
✔ Not over-engineered
✔ Visually impressive

---

## 8️⃣ Backend Technology Stack

* **FastAPI** – API layer
* **Python** – Data processing
* **Pandas / Polars** – Dataset handling
* **Scikit-learn** – Encoding & preprocessing
* **Gemini API** – LLM reasoning
* **Agent-based architecture** – Modular, extensible

---

## 9️⃣ Why This Project Stands Out

* Research-inspired (ASE 2024)
* True **agentic AI**, not prompt-only
* Solves a real industry problem
* Non-technical user focus
* Clean separation of concerns
* Expandable to:

  * RAG memory
  * ML-based feature inference
  * Cloud deployment

---

## 🔚 Final One-Line Summary (for viva / demo)

> *“This project implements an agentic AI-based data wrangling system inspired by the AutoDW research paper, where a Large Language Model understands user intent, plans data transformations autonomously, and produces clean, ready-to-use datasets for non-technical users through a ChatGPT-style interface.”*
