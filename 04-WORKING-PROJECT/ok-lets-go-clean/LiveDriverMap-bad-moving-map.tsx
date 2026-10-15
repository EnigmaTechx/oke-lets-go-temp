import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type LiveDriverMapProps = {
  pickupCoordinate: MapCoordinate;
  driverCoordinate?: MapCoordinate;
};

export default function LiveDriverMap({
  pickupCoordinate,
  driverCoordinate,
}: LiveDriverMapProps) {
  const mapHtml = useMemo(() => {
    const safePickup = pickupCoordinate ?? {
      latitude: 43.65345,
      longitude: -79.3841,
    };
    const targetLat = safePickup.latitude;
    const targetLng = safePickup.longitude;
    const driverLat = driverCoordinate?.latitude;
    const driverLng = driverCoordinate?.longitude;
    const hasDriver =
      typeof driverLat === "number" && typeof driverLng === "number";

    return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=yes" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { width: 100%; height: 100%; margin: 0; padding: 0; background: #131D2E; }
    .driver-wrap { background: transparent; border: 0; }
    .driver-badge {
      min-width: 58px;
      height: 30px;
      padding: 0 9px;
      border-radius: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-sizing: border-box;
      background: #2563EB;
      border: 3px solid #FFFFFF;
      color: #FFFFFF;
      font-family: Arial, sans-serif;
      font-size: 10px;
      font-weight: 900;
      letter-spacing: .6px;
      box-shadow: 0 2px 8px rgba(0,0,0,.45);
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const target = [${targetLat}, ${targetLng}];
    const map = L.map('map', { zoomControl: true, attributionControl: true });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    L.circleMarker(target, {
      radius: 9,
      color: '#FFFFFF',
      weight: 3,
      fillColor: '#16A34A',
      fillOpacity: 1
    }).addTo(map);

    ${hasDriver ? `
    const driverStart = [${driverLat}, ${driverLng}];
    const driverIcon = L.divIcon({
      className: 'driver-wrap',
      html: '<div class="driver-badge">DRIVER</div>',
      iconSize: [58, 30],
      iconAnchor: [29, 15]
    });
    const driverMarker = L.marker(driverStart, { icon: driverIcon, zIndexOffset: 1000 }).addTo(map);

    const bounds = L.latLngBounds([target, driverStart]);
    if (bounds.isValid() && !bounds.getNorthEast().equals(bounds.getSouthWest())) {
      map.fitBounds(bounds.pad(0.55), { maxZoom: 15 });
    } else {
      map.setView(target, 15);
    }

    const started = Date.now();
    const duration = 12000;
    const timer = setInterval(() => {
      const elapsed = Date.now() - started;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress * (2 - progress);
      const lat = driverStart[0] + (target[0] - driverStart[0]) * eased;
      const lng = driverStart[1] + (target[1] - driverStart[1]) * eased;
      driverMarker.setLatLng([lat, lng]);
      if (progress >= 1) clearInterval(timer);
    }, 350);
    ` : `map.setView(target, 15);`}
  </script>
</body>
</html>`;
  }, [pickupCoordinate, driverCoordinate]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ html: mapHtml }}
        style={styles.map}
        originWhitelist={["*"]}
        javaScriptEnabled
        domStorageEnabled
        startInLoadingState
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#131D2E",
    overflow: "hidden",
  },
  map: {
    flex: 1,
    backgroundColor: "#131D2E",
  },
});
