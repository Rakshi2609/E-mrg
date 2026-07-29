from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    mongodb_uri: str = "mongodb://localhost:27017/emergency_dispatcher"
    ollama_url: str = "http://localhost:11434"
    gemma_model: str = "gemma3"
    service_name: str = "emergency-ai-api"
    environment: str = "development"
    log_level: str = "INFO"
    jwt_secret: SecretStr = SecretStr("development-only-secret-key-32-bytes")
    twilio_auth_token: str = "development-twilio-token"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
