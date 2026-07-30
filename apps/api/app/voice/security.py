import hashlib
import hmac


def twilio_signature(url: str, params: dict[str, str], auth_token: str) -> str:
    payload = url + "".join(key + params[key] for key in sorted(params))
    digest = hmac.new(auth_token.encode(), payload.encode(), hashlib.sha1).digest()
    import base64
    return base64.b64encode(digest).decode()


def validate_twilio_signature(url: str, params: dict[str, str], signature: str | None, auth_token: str) -> bool:
    if not signature or not auth_token:
        return False
    expected = twilio_signature(url, params, auth_token)
    return hmac.compare_digest(expected, signature)
