from pydantic import BaseSettings
from dotenv import load_dotenv
import os
from fastapi_jwt_auth import AuthJWT

load_dotenv()

class Settings(BaseSettings):
    authjwt_secret_key: str = os.getenv("SECRET_KEY")

@AuthJWT.load_config
def get_config():
    return Settings()
