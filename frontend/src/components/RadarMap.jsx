import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./RadarMap.css";

// Fix for default markers in leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const RadarMap = () => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [status, setStatus] = useState("loading");
  const [currentData, setCurrentData] = useState(null); // Add this state to store current data

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    // Initialize map
    mapInstance.current = L.map(mapRef.current).setView([39.8283, -98.5795], 4);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 10,
      minZoom: 3,
    }).addTo(mapInstance.current);

    // Fetch radar data
    fetchRadarData();

    // Set up refresh interval (2 minutes)
    const interval = setInterval(fetchRadarData, 120000);

    // Cleanup function
    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      clearInterval(interval);
    };
  }, []);

  const fetchRadarData = async () => {
    try {
      setStatus("loading");
      console.log("🔄 Fetching radar data from backend...");

      const response = await fetch("https://backend-weather-radar-production.up.railway.app/api/radar/latest", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("  Radar data received:", data);

      // Validate data structure before processing
      if (!data.success) {
        throw new Error(data.error || "Server returned unsuccessful response");
      }

      if (
        !data.data ||
        !data.data.features ||
        !Array.isArray(data.data.features)
      ) {
        console.warn("⚠️ Invalid data structure, features array missing");
        // Don't throw error, just use empty features
        data.data = {
          type: "FeatureCollection",
          features: [],
          ...data.data,
        };
      }

      setStatus("success");
      setLastUpdate(new Date(data.timestamp).toLocaleString());
      setCurrentData(data); // Store the current data
      updateRadarOverlay(data);
    } catch (error) {
      console.error("❌ Error fetching radar data:", error);
      setStatus("error");
      showErrorOverlay(error.message);
    }
  };

  const updateRadarOverlay = (data) => {
    if (!mapInstance.current) return;

    // Clear existing overlays
    mapInstance.current.eachLayer((layer) => {
      if (layer instanceof L.Rectangle || layer instanceof L.FeatureGroup) {
        mapInstance.current.removeLayer(layer);
      }
    });

    // Add radar coverage area
    const bounds = data.bounds || [
      [24.396308, -125.0],
      [49.384358, -66.93457],
    ];
    const radarOverlay = L.rectangle(bounds, {
      color: "#3388ff",
      weight: 2,
      fillColor: "#3388ff",
      fillOpacity: 0.03,
    }).addTo(mapInstance.current);

    // Determine if this is real MRMS data
    const isRealMRMS = data.source && data.source.includes("NOAA MRMS");
    const dataSource = isRealMRMS
      ? "🛰️ NOAA MRMS Real Data"
      : "🌪️ MRMS Enhanced Data";
    const dataStatus = data.cached ? " (Cached)" : " (Live)";

    radarOverlay
      .bindPopup(
        `
    <div style="min-width: 320px">
      <strong>${dataSource}${dataStatus}</strong><br/>
      <hr style="margin: 5px 0;">
      <strong>Product:</strong> Reflectivity at Lowest Altitude (RALA)<br/>
      <strong>Last Update:</strong> ${new Date(
        data.timestamp
      ).toLocaleString()}<br/>
      <strong>Coverage:</strong> Continental US (CONUS)<br/>
      <strong>Data Points:</strong> ${
        data.data.features?.length || 0
      } locations<br/>
      <strong>Source:</strong> ${data.source || "NOAA MRMS"}<br/>
      <strong>Status:</strong> ${data.note || "Operational"}<br/>
      <div style="margin-top: 8px; padding: 8px; background: ${
        isRealMRMS ? "#f0fff0" : "#fff9f0"
      }; border-radius: 4px; border-left: 4px solid ${
          isRealMRMS ? "#28a745" : "#ffc107"
        };">
        <small>${
          isRealMRMS
            ? "  Direct NOAA MRMS Data Feed"
            : "🔄 MRMS Data Processing"
        }</small>
      </div>
    </div>
  `
      )
      .openPopup();

    // Add radar data points - with safety check
    if (data.data && data.data.features && Array.isArray(data.data.features)) {
      const featureGroup = L.featureGroup().addTo(mapInstance.current);
      let validPoints = 0;

      data.data.features.forEach((feature, index) => {
        // Validate feature structure
        if (
          feature &&
          feature.geometry &&
          feature.geometry.coordinates &&
          Array.isArray(feature.geometry.coordinates) &&
          feature.geometry.coordinates.length === 2
        ) {
          const [lng, lat] = feature.geometry.coordinates;
          const reflectivity = feature.properties?.reflectivity || 0;

          // Realistic radar color scheme
          let color, intensity;
          if (reflectivity >= 50) {
            color = "#ff00ff"; // Purple - extreme
            intensity = "Extreme";
          } else if (reflectivity >= 40) {
            color = "#ff0000"; // Red - heavy
            intensity = "Heavy";
          } else if (reflectivity >= 30) {
            color = "#ff8800"; // Orange - moderate
            intensity = "Moderate";
          } else if (reflectivity >= 20) {
            color = "#ffff00"; // Yellow - light
            intensity = "Light";
          } else {
            color = "#00ff00"; // Green - very light
            intensity = "Very Light";
          }

          const marker = L.circleMarker([lat, lng], {
            radius: isRealMRMS ? 6 : 5,
            fillColor: color,
            color: "#000",
            weight: 1,
            opacity: 0.8,
            fillOpacity: isRealMRMS ? 0.7 : 0.6,
          }).bindPopup(`
          <div style="min-width: 220px">
            <strong>${
              isRealMRMS ? "🛰️ MRMS Radar" : "📡 Radar"
            } Location</strong><br/>
            <hr style="margin: 3px 0;">
            <strong>Reflectivity:</strong> <span style="color: ${color}; font-weight: bold">${reflectivity} dBZ</span><br/>
            <strong>Intensity:</strong> ${intensity}<br/>
            <strong>Coordinates:</strong> ${lat.toFixed(2)}°, ${lng.toFixed(
            2
          )}°<br/>
            ${
              feature.properties?.systemType
                ? `<strong>System:</strong> ${feature.properties.systemType}<br/>`
                : ""
            }
            <em style="color: #666; font-size: 0.8em;">${
              data.source || "NOAA MRMS"
            }</em>
          </div>
        `);

          featureGroup.addLayer(marker);
          validPoints++;
        }
      });

      console.log(`📍 Displayed ${validPoints} valid radar points`);

      // Fit bounds to show all points but don't zoom too much
      if (validPoints > 0) {
        const groupBounds = featureGroup.getBounds();
        mapInstance.current.fitBounds(groupBounds, {
          padding: [30, 30],
          maxZoom: 6,
        });
      }
    } else {
      console.warn("⚠️ No valid features to display");
    }
  };

  const showErrorOverlay = (errorMessage) => {
    if (!mapInstance.current) return;

    const bounds = [
      [24.396308, -125.0],
      [49.384358, -66.93457],
    ];
    const errorOverlay = L.rectangle(bounds, {
      color: "#ff0000",
      weight: 2,
      fillColor: "#ff0000",
      fillOpacity: 0.1,
    }).addTo(mapInstance.current);

    errorOverlay
      .bindPopup(
        `
      <div style="min-width: 280px">
        <strong>❌ Backend Connection Failed</strong><br/>
        <hr style="margin: 5px 0;">
        <strong>Error:</strong> ${errorMessage}<br/>
        <br/>
        <strong>🔧 Troubleshooting Steps:</strong><br/>
        1. Check if backend is running: <code>npm run dev</code> in backend folder<br/>
        2. Test backend directly: <a href="https://backend-weather-radar-production.up.railway.app/health" target="_blank">https://backend-weather-radar-production.up.railway.app/health</a><br/>
        3. Verify no other service is using port 5000<br/>
        4. Check console for detailed errors
      </div>
    `
      )
      .openPopup();
  };

  // Determine data source for display
  const getDataSourceDisplay = () => {
    if (!currentData) return "MRMS Enhanced";
    return currentData.source && currentData.source.includes("NOAA MRMS")
      ? "NOAA MRMS RALA"
      : "MRMS Enhanced";
  };

  return (
    <div className="radar-map-container">
      <div className="map-status">
        <div className={`status-indicator ${status}`}>
          {status === "loading"
            ? "🔄 Loading Radar Data..."
            : status === "success"
            ? "  Connected to MRMS Data"
            : "❌ Connection Error"}
        </div>
        {lastUpdate && (
          <div className="last-update">Last update: {lastUpdate}</div>
        )}
        <div className="data-info">
          Data: {getDataSourceDisplay()} • Updates every 2 min
        </div>
      </div>
      <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
    </div>
  );
};

export default RadarMap;