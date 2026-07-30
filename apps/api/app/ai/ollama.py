import httpx


class OllamaProvider:
    def __init__(self, base_url: str, model: str, client: httpx.AsyncClient | None = None) -> None:
        self.base_url = base_url.rstrip("/")
        self.model = model
        self.client = client or httpx.AsyncClient(timeout=10.0)
        self._owns_client = client is None

    async def respond(self, prompt: str) -> str:
        response = await self.client.post(f"{self.base_url}/api/generate", json={"model": self.model, "prompt": prompt, "stream": False})
        response.raise_for_status()
        payload = response.json()
        generated = payload.get("response")
        if not isinstance(generated, str) or not generated.strip():
            raise ValueError("Ollama returned an empty response")
        return generated

    async def close(self) -> None:
        if self._owns_client:
            await self.client.aclose()
