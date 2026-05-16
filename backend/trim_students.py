import asyncio, os
from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
load_dotenv()

async def trim():
    client = AsyncIOMotorClient(os.getenv('MONGO_URI'), tls=True, tlsAllowInvalidCertificates=True, serverSelectionTimeoutMS=10000)
    col = client['alias_db']['students']
    total = await col.count_documents({})
    excess = total - 1200
    print(f'Total: {total}, removing {excess}')
    if excess > 0:
        docs = await col.find({}, {'_id': 1}).sort('createdAt', -1).limit(excess).to_list(length=excess)
        ids = [d['_id'] for d in docs]
        result = await col.delete_many({'_id': {'$in': ids}})
        print(f'Deleted {result.deleted_count}')
    print(f'Final count: {await col.count_documents({})}')
    client.close()

asyncio.run(trim())
