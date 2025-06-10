from fastapi import FastAPI
from schemas.message import Message
from DetoxifyMultillingual.DetoxifyMultillingual import Detoxify

# detoxify instance
detoxify = Detoxify()

app = FastAPI()

@app.post("/moderate")
async def moderate(message: Message):
    results = detoxify.predict(message.content)
    results = {key: float(value) for key, value in results.items()}
    return {"results":  results}