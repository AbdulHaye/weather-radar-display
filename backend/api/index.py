from flask import Flask, jsonify

app = Flask(__name__)

@app.route('/api/radar', methods=['GET'])
def get_radar_data():
    return jsonify({"message": "Data fetched successfully"})

@app.route('/api/radar/latest', methods=['GET'])
def get_latest_radar_data():
    return jsonify({"message": "Latest radar data fetched successfully"})

# Needed for Vercel
app = app

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
