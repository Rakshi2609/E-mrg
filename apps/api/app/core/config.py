from functools import lru_cache

from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")
    mongodb_uri: str = "mongodb://localhost:27017/emergency_dispatcher"
    ollama_url: str = "http://localhost:11434"
    gemma_model: str = "gemma3"
    ollama_timeout_seconds: float = 10.0
    mistral_api_key: SecretStr | None = None
    mistral_model: str = "mistral-small-latest"
    service_name: str = "emergency-ai-api"
    environment: str = "development"
    log_level: str = "INFO"
    jwt_secret: SecretStr = SecretStr("development-only-secret-key-32-bytes")
    demo_admin_username: str = "admin123"
    demo_admin_password: SecretStr = SecretStr("123123")
    twilio_auth_token: str = "development-twilio-token"
    twilio_account_sid: str | None = None
    twilio_phone_number: str | None = None
    dispatcher_phone_number: str = "+919461284678"
    cors_origins: str = "http://localhost:3000,http://127.0.0.1:3000"


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
