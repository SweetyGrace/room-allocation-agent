from dataclasses import dataclass
import httpx


@dataclass
class AgentDeps:
    """
    Context passed to every PydanticAI tool on each call.
    The agent never holds credentials — they flow in per-request
    from the admin's browser session via the FastAPI endpoint.
    """
    nest_base_url: str       # e.g. http://localhost:9000
    auth_token: str          # JWT forwarded from the admin's session
    program_id: int          # top-level program (e.g. HDB/MSD 2025-26)
    sub_program_id: int      # selected sub-program (e.g. MSD 1 = 1083)
    http_client: httpx.AsyncClient

    @property
    def auth_header(self) -> str:
        """NestJS expects 'Bearer <token> custom' format."""
        return f"Bearer {self.auth_token} custom"
