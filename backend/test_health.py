import requests
try:
    print("Pinging health...")
    r = requests.get("http://localhost:8000/health", timeout=10)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"Error: {e}")
