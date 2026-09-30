from functools import lru_cache
from typing import Literal
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    model_config=SettingsConfigDict(env_file=".env",extra="ignore")
    app_name:str=Field("AI Company OS API",validation_alias="APP_NAME")
    app_env:Literal["development","production"]=Field("development",validation_alias="APP_ENV")
    app_version:str=Field("0.1",validation_alias="APP_VERSION")
    database_url:str=Field(...,validation_alias="DATABASE_URL")
    redis_url:str=Field(...,validation_alias="REDIS_URL")
    openai_api_key:str|None=Field(None,validation_alias="OPENAI_API_KEY")
    openai_model:str=Field("gpt-4o-mini",validation_alias="OPENAI_MODEL")
    cors_origins:str=Field("http://localhost:3000",validation_alias="CORS_ORIGINS")
    @property
    def cors_origin_list(self): return [x.strip() for x in self.cors_origins.split(',') if x.strip()]
@lru_cache
def get_settings(): return Settings()
