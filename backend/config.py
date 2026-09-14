from pydantic_settings import BaseSettings, SettingsConfigDict
class Settings(BaseSettings):
    database_url:str="postgresql+psycopg://cpse:cpse_password@localhost:5432/cpse_match"
    ai_model:str="all-MiniLM-L6-v2"
    model_config=SettingsConfigDict(env_file=".env",extra="ignore")
settings=Settings()
