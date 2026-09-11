import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env if present
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "CAMPUS ORBIT"
    TAGLINE: str = "Plan smarter. Coordinate automatically. Adapt instantly."
    DESCRIPTION: str = "An agentic AI platform that transforms campus event requirements into executable operational plans and dynamically adapts them when conditions change."
    VERSION: str = "1.0.0"
    
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "0.0.0.0")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    
    # AI configuration
    AI_PROVIDER: str = os.getenv("AI_PROVIDER", "gemini")
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    AI_MODEL: str = os.getenv("AI_MODEL", "gemini-1.5-flash")
    
    @property
    def is_ai_configured(self) -> bool:
        return bool(self.GEMINI_API_KEY or self.OPENAI_API_KEY)
    
    @property
    def mode_label(self) -> str:
        return "AI MODE" if self.is_ai_configured else "DEMO MODE"

settings = Settings()
