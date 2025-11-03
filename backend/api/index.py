# /api/index.py example
from flask import Flask
app = Flask(__name__)

@app.route('/api/radar', methods=['GET'])
def get_radar_data():
    # Your MRMS data processing logic here
    return {"message": "Data fetched successfully"}