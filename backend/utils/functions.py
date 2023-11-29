from django.conf import settings
from django.http import HttpResponse
import jwt
import time


def generate_jwt(lifespan: int, id: int) -> str:
    '''Function that will generate a jwt token with the id and secret'''
    current_time: int = int(time.time())
    payload: dict[str, any] = {
        "iss": "pong99",
        "sub": id,
        "exp": current_time + lifespan,
        "iat": current_time
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def first_token(response: HttpResponse, id: int) -> HttpResponse:
    '''Adds an element to the header to signal to the frontend that it is the first token,
       preventing the frontend to fetch twice.
    '''
    response["new"] = "True"
    return add_double_jwt(response, id)

def add_double_jwt(response: HttpResponse, id: int) -> HttpResponse:
    '''Create access and refresh token and add them to the http response'''
    REFRESH_DURATION: int = 10
    ACCESS_DURATION: int = 5

    access_token = generate_jwt(ACCESS_DURATION, id)
    refresh_token = generate_jwt(REFRESH_DURATION, id)
    response.set_cookie(
        key="refresh_jwt", value=refresh_token, secure=True, httponly=True, samesite="None")
    response["jwt"] = access_token
    return response


def decrypt_user_id(jwt_token: str) -> int:
    '''Decrypt the user id and send it back, if any error happen send
    a negative integer'''
    EXPIRED: int = -1
    INVALID: int = -2

    try:
        decrypt_token: dict = jwt.decode(
            jwt_token, settings.SECRET_KEY, algorithms=["HS256"])
        return decrypt_token.get("sub")
    except jwt.ExpiredSignatureError:
        return EXPIRED
    except jwt.InvalidTokenError:
        return INVALID
