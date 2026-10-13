from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas import AIRecommendationResponse, AIChatQuery, AIChatResponse
from ai_advisor import get_ai_recommendations, ask_assistant

router = APIRouter(prefix="/api/ai", tags=["AI Recommendations"])

@router.get("/recommendations", response_model=AIRecommendationResponse)
async def get_recommendations(db: Session = Depends(get_db)):
    """
    Returns AI / Rule-based dynamic truck routing, predictive overflow warnings,
    and bin capacity re-allocation suggestions.
    """
    return await get_ai_recommendations(db)

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_waste_copilot(query: AIChatQuery):
    """
    Campus Sustainability AI Copilot. Uses Gemini if API key is provided,
    otherwise uses intelligent rule-based knowledge engine fallback.
    """
    result = await ask_assistant(query.message)
    return AIChatResponse(
        response=result["response"],
        source=result["source"]
    )
