import base64
import httpx


def _strip_markdown_fence(content: str) -> str:
    stripped = content.strip()
    if stripped.startswith("```") and stripped.endswith("```"):
        return "\n".join(stripped.splitlines()[1:-1]).strip()
    return stripped


class MistralCloudProvider:
    """Mistral Chat Completions provider used only after local inference fails or times out."""

    def __init__(self, api_key: str, model: str, client: httpx.AsyncClient | None = None) -> None:
        self.api_key = api_key
        self.model = model
        self.client = client or httpx.AsyncClient(timeout=30.0)
        self._owns_client = client is None

    async def respond(self, prompt: str) -> str:
        response = await self.client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={"model": self.model, "messages": [{"role": "user", "content": prompt}], "temperature": 0.2},
        )
        response.raise_for_status()
        payload = response.json()
        choices = payload.get("choices")
        if not isinstance(choices, list) or not choices:
            raise ValueError("Mistral returned no choices")
        message = choices[0].get("message")
        content = message.get("content") if isinstance(message, dict) else None
        if not isinstance(content, str) or not content.strip():
            raise ValueError("Mistral returned an empty response")
        return _strip_markdown_fence(content)

    async def analyze_image(self, prompt: str, image: bytes, mime_type: str = "image/png") -> str:
        """Analyze an image with Mistral Vision using an inline base64 data URL."""
        encoded_image = base64.b64encode(image).decode("ascii")
        response = await self.client.post(
            "https://api.mistral.ai/v1/chat/completions",
            headers={"Authorization": f"Bearer {self.api_key}"},
            json={
                "model": self.model,
                "messages": [{"role": "user", "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": f"data:{mime_type};base64,{encoded_image}"},
                ]}],
                "temperature": 0.1,
                "response_format": {"type": "json_object"},
            },
        )
        response.raise_for_status()
        payload = response.json()
        choices = payload.get("choices")
        message = choices[0].get("message") if isinstance(choices, list) and choices else None
        content = message.get("content") if isinstance(message, dict) else None
        if not isinstance(content, str) or not content.strip():
            raise ValueError("Mistral returned an empty CCTV analysis")
        return _strip_markdown_fence(content)

    async def close(self) -> None:
        if self._owns_client:
            await self.client.aclose()
