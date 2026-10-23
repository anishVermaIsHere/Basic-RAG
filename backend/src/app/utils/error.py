from fastapi import Request, HTTPException


class GlobalError():
    def __init__(self):
        return

    def set_error(message: str, status_code: int = 500):
        # Pass error 
        raise HTTPException(status_code=status_code, detail=message)
