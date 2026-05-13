import requests
try:
    print("Pinging root...")
    r = requests.get("http://localhost:8000/", timeout=5)
    print(f"Status: {r.status_code}")
    print(f"Response: {r.json()}")
except Exception as e:
    print(f"Error: {e}")
