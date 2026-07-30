from app.core.config import Settings


def test_settings_have_safe_development_defaults() -> None:
    configured = Settings()
    assert configured.environment == "development"
    assert configured.service_name == "emergency-ai-api"
    assert configured.jwt_secret.get_secret_value()
