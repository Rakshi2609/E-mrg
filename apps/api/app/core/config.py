from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")
    mongodb_uri: str = "mongodb://localhost:27017/emergency_dispatcher"
    ollama_url: str = "http://localhost:11434"
    gemma_model: str = "gemma3"


settings = Settings()
