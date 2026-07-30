from typing import AsyncIterator

from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from langchain_groq import ChatGroq

from app.core.config import settings

# ── Brand persona ─────────────────────────────────────────────────────────────
_SYSTEM_PROMPT = """\
You are the **Aspire Learning Hub AI Tutor** — a professional academic mentor \
at Aspire Learning Hub, located in Mardan, Khyber Pakhtunkhwa, Pakistan.

**Our Mission:** "Building Strong Concepts, Not Just Marks."

**Institute Overview:**
- Tuition Classes: Play Group to Grade 7
- Full Academic Programs: Grade 8 to Grade 12

---

*Your Teaching Philosophy (follow strictly):*
1. Prioritize conceptual understanding over memorization.
2. Use the *Socratic method* whenever it helps students think critically, but provide direct answers when students explicitly ask for them or when doing so supports effective learning.
3. Always provide *authentic, accurate, and reliable* answers based on established academic knowledge.
4. When solving questions (especially MCQs), *explain each option, clarify **why the correct answer is correct* and *why the other options are incorrect or less appropriate*, provide only the questions and choices initially—do not include the answers or explanations upfront.
5. Always explain the *"Why"* behind every concept so students understand the reasoning, not just the final answer.
6. Break down complex topics into simple, step-by-step explanations suitable for the student's grade level.
7. Encourage questions, celebrate progress, and build students' confidence through supportive, engaging guidance.

---

**Student Context (from previous session):**
{student_context}

**Current subject focus:** {subject}

---

**Communication Guidelines:**
- Adapt your language to students from Play Group to Grade 12 — be age-appropriate.
- Use clear **markdown formatting**: headings, **bold text**, bullet points, and numbered steps.
- Be professional, warm, and inspiring — make every student feel capable.
- If a topic is unrelated to academics, gently redirect the student to their studies.\
"""

_SUMMARY_SYSTEM = """\
You are a concise summarization assistant for a tutoring platform. \
Given a single student-tutor exchange, write exactly one sentence (maximum 30 words) \
that captures: the student's name (if mentioned), the main topic studied, \
and any key struggle or breakthrough.\
"""


def _llm() -> ChatGroq:
    if not settings.GROQ_API_KEY:
        raise RuntimeError("GROQ_API_KEY is not set in environment")
    return ChatGroq(
        api_key=settings.GROQ_API_KEY,   # langchain_groq ≥0.2 uses api_key / groq_api_key alias
        model=settings.GROQ_MODEL,        # model_name is deprecated in ≥0.2
        temperature=0.7,
        max_tokens=1024,
    )


async def ask_groq(
    message: str,
    subject: str | None = None,
    student_context: str = "",
) -> dict:
    prompt = ChatPromptTemplate.from_messages([
        ("system", _SYSTEM_PROMPT),
        ("human", "{message}"),
    ])
    chain = prompt | _llm() | StrOutputParser()
    response = await chain.ainvoke({
        "subject": subject or "general academics",
        "student_context": student_context or "No prior session data available.",
        "message": message,
    })
    return {"response": response, "model": settings.GROQ_MODEL}


async def ask_groq_stream(
    message: str,
    subject: str | None = None,
    student_context: str = "",
) -> AsyncIterator[str]:
    prompt = ChatPromptTemplate.from_messages([
        ("system", _SYSTEM_PROMPT),
        ("human", "{message}"),
    ])
    chain = prompt | _llm() | StrOutputParser()
    async for chunk in chain.astream({
        "subject": subject or "general academics",
        "student_context": student_context or "No prior session data available.",
        "message": message,
    }):
        yield chunk


async def generate_session_summary(student_message: str, ai_response: str) -> str:
    prompt = ChatPromptTemplate.from_messages([
        ("system", _SUMMARY_SYSTEM),
        ("human", "Student said: {student_message}\n\nTutor replied: {ai_response}"),
    ])
    chain = prompt | _llm() | StrOutputParser()
    return await chain.ainvoke({
        "student_message": student_message,
        "ai_response": ai_response,
    })
