import asyncio
import certifi
import os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv

load_dotenv()

uri = os.getenv("MONGO_URI")

async def test():
    client = AsyncIOMotorClient(uri, tls=True, tlsCAFile=certifi.where(), serverSelectionTimeoutMS=30000)
    result = await client.admin.command("ping")
    print("MongoDB ping OK:", result)
    client.close()

asyncio.run(test())
