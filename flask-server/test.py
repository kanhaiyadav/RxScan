import requests

sku_id = "12345"  # From Search API result

url = f"https://www.1mg.com/drugapi/staticdata?drug_sku_id={sku_id}&locale=en"
headers = {
    "User-Agent": "Mozilla/5.0",
    "X-Platform": "web",  # seen in browser requests
    "X-City": "Delhi"     # location context for availability
}

response = requests.get(url, headers=headers)
data = response.json()

print(data)
