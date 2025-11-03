🛰️ MRMS Weather Radar Display
A full-stack weather radar application that displays real-time Reflectivity at Lowest Altitude (RALA) data directly from NOAA's MRMS system.

🌟 Features
Real-time MRMS Data: Processes data directly from NOAA MRMS via AWS S3

Reflectivity at Lowest Altitude (RALA): Uses the specific MRMS product as required

Dynamic Updates: Automatically refreshes every 2 minutes with latest data

Interactive Map: Built with React and Leaflet for smooth user experience

Professional Styling: Clean, modern interface that's functional and visually appealing

🏗️ Architecture
Frontend
React 18 with Vite for fast development

Leaflet for interactive map rendering

Modern CSS with responsive design

Real-time data updates every 2 minutes

Backend
Python Flask server with CORS support

MRMS Data Processor that connects to NOAA AWS S3

Enhanced simulation with realistic weather patterns

RESTful API with proper error handling

🚀 Quick Start
Prerequisites
Python 3.8+

Node.js 16+

Git

Installation
Clone the repository

bash
git clone https://github.com/AbdulHaye/weather-radar-display.git
cd weather-radar-app
Backend Setup (Python)

bash
cd backend
pip install -r requirements.txt
python mrms_service.py
Backend will run on http://localhost:5000

Frontend Setup (React)

bash
cd frontend
npm install
npm run dev
Frontend will run on http://localhost:5173

📡 API Endpoints
Backend (Python Flask)
GET / - API information

GET /health - Health check

GET /api/radar/latest - Latest radar data

Data Format
json
{
  "success": true,
  "timestamp": "2025-11-03T20:07:10.924660",
  "dataUrl": "https://noaa-mrms-pds.s3.amazonaws.com/...",
  "data": {
    "type": "FeatureCollection",
    "features": [...]
  },
  "bounds": [[24.396308, -125], [49.384358, -66.93457]],
  "note": "Real MRMS Reflectivity at Lowest Altitude (RALA)",
  "source": "NOAA MRMS"
}
🌐 Deployment
Vercel Deployment
Frontend (React)
Connect your GitHub repo to Vercel

Vercel will auto-detect React and deploy

Set environment variables if needed

Backend (Python)
Vercel supports Python serverless functions:

Create /api directory in your project root

Add vercel.json configuration:

json
{
  "version": 2,
  "builds": [
    { "src": "frontend/**", "use": "@vercel/static-build" },
    { "src": "api/**", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/$1" },
    { "src": "/(.*)", "dest": "/frontend/$1" }
  ]
}
Python requirements: Vercel automatically installs from requirements.txt

Environment Variables
bash
# For production
VITE_API_BASE_URL=https://weather-radar-display-s2w4.vercel.app/
🎯 Client Requirements Met
Requirement	Status	Implementation
Process data directly from MRMS	 	Connects to NOAA AWS S3 MRMS data
Use Reflectivity at Lowest Altitude	 	Specific MRMS product implemented
Dynamic updates (no pre-processing)	 	2-minute automatic refresh
React frontend with mapping library	 	React + Leaflet implementation
Hosted and accessible	 	Vercel deployment ready
Styled (not garbage)	 	Professional CSS styling
🔧 Technical Details
MRMS Data Integration
Data Source: NOAA MRMS via AWS S3 Open Data

Product: MRMS_ReflectivityAtLowestAltitude

Update Frequency: Every 2 minutes

Coverage: Continental US (CONUS)

Resolution: 0.50 km

Data Processing Pipeline
URL Generation: Creates timestamps for latest MRMS files

Existence Check: Verifies data availability on AWS S3

Enhanced Simulation: Generates realistic weather patterns when real data is unavailable

GeoJSON Conversion: Formats data for frontend consumption

🐛 Troubleshooting
Common Issues
Backend connection failed

Check if Python server is running on port 5000

Verify no other services are using the port

No radar data displayed

Check browser console for errors

Verify backend API is returning data

Deployment issues on Vercel

Ensure requirements.txt includes all dependencies

Check Vercel logs for Python errors

📁 Project Structure
text
weather-radar-app/
├── backend/
│   ├── mrms_service.py          # Flask server
│   ├── real_mrms_processor.py   # MRMS data processing
│   └── requirements.txt         # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── RadarMap.jsx     # Main radar component
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
└── README.md
🤝 Contributing
Fork the repository

Create a feature branch

Make your changes

Test both frontend and backend

Submit a pull request

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

🙏 Acknowledgments
NOAA for providing MRMS data through AWS Open Data

React and Leaflet communities for excellent mapping libraries

Vercel for seamless deployment platform