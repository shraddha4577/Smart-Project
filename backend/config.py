import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "Smart Waste Management Digital Twin"
    DATABASE_URL: str = "sqlite:///./smart_waste.db"
    GEMINI_API_KEY: str = ""
    WARNING_THRESHOLD: float = 70.0
    CRITICAL_THRESHOLD: float = 90.0
    SIMULATION_INTERVAL_SEC: int = 5
    MAP_DEFAULT_LAT: float = 12.9716
    MAP_DEFAULT_LNG: float = 77.5946
    MAP_DEFAULT_ZOOM: int = 16

    model_config = SettingsConfigDict(env_file=".env", extra="allow")

settings = Settings()
