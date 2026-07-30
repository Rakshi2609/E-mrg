from typing import Literal

from pydantic import BaseModel, ConfigDict, Field

Role = Literal["dispatcher", "supervisor", "admin"]


class Principal(BaseModel):
    model_config = ConfigDict(frozen=True)

    user_id: str = Field(min_length=1)
    role: Role
