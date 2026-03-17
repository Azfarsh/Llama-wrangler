"""
RAG Service: lightweight in-memory retrieval without external embedding provider.
Gemini-only runtime compatibility.
"""
from typing import List, Dict, Any


class RAGService:
    """Lightweight RAG using token overlap scoring."""

    def __init__(self):
        self._chunks: List[Dict[str, Any]] = []  # [{"text": str, "tokens": set, "meta": dict}]

    def index_profile(self, profile: Dict[str, Any], session_id: str) -> None:
        """Create chunks from dataset profile and index them."""
        self._chunks = []
        chunks_text: List[str] = []

        columns = profile.get("columns", [])
        columns_str = ", ".join(columns[:50])
        chunks_text.append(f"Dataset columns: {columns_str}")

        for col in columns[:20]:
            dtype = profile.get("dtypes", {}).get(col, "unknown")
            missing = profile.get("missing_values", {}).get(col, 0)
            chunks_text.append(f"Column '{col}' type {dtype} with {missing} missing values")

        if profile.get("numeric_columns"):
            chunks_text.append(f"Numeric columns: {', '.join(profile['numeric_columns'][:15])}")
        if profile.get("categorical_columns"):
            chunks_text.append(f"Categorical columns: {', '.join(profile['categorical_columns'][:15])}")

        head = profile.get("head", [])
        if head:
            sample_row = head[0] if isinstance(head[0], dict) else {}
            sample_str = ", ".join(f"{k}={v}" for k, v in list(sample_row.items())[:8])
            chunks_text.append(f"Sample row: {sample_str}")

        chunks_text.append(f"Total rows: {profile.get('total_rows', 0)}, columns: {profile.get('total_columns', 0)}")

        for i, text in enumerate(chunks_text):
            tokens = set(str(text).lower().split())
            self._chunks.append({
                "text": text,
                "tokens": tokens,
                "meta": {"session_id": session_id, "idx": i},
            })

    def retrieve(self, query: str, top_k: int = 5) -> List[str]:
        """Retrieve top-k most relevant chunks for the query."""
        if not self._chunks:
            return []
        q_tokens = set(str(query or "").lower().split())
        if not q_tokens:
            return [c["text"] for c in self._chunks[:top_k]]
        scored: List[tuple] = []
        for c in self._chunks:
            c_tokens = c.get("tokens", set())
            overlap = len(q_tokens.intersection(c_tokens))
            scored.append((overlap, c["text"]))
        scored.sort(key=lambda x: x[0], reverse=True)
        return [s[1] for s in scored[:top_k]]

    def get_rag_context(self, query: str, profile: Dict[str, Any], top_k: int = 5) -> str:
        """
        Get RAG-augmented context for LLM prompt.
        Falls back to profile summary if embeddings unavailable.
        """
        if not self._chunks:
            self.index_profile(profile, profile.get("session_id", ""))
        retrieved = self.retrieve(query, top_k=top_k)
        if retrieved:
            return "Relevant dataset context:\n" + "\n".join(f"- {r}" for r in retrieved)
        return f"Dataset: {profile.get('total_rows', 0)} rows, {profile.get('total_columns', 0)} columns. Columns: {profile.get('columns', [])[:20]}"
