from fastapi_jwt_auth import AuthJWT

def create_jwt(email, role, is_approved=True):
    Authorize = AuthJWT()
    claims = {
        "role": role,
        "is_approved": is_approved
    }
    return Authorize.create_access_token(subject=email, user_claims=claims)
