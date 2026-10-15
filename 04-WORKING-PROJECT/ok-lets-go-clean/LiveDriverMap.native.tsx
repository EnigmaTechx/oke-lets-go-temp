import React, { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

export type MapCoordinate = {
  latitude: number;
  longitude: number;
};

type LiveDriverMapProps = {
  pickupCoordinate: MapCoordinate;
};

export default function LiveDriverMap({
  pickupCoordinate,
}: LiveDriverMapProps) {
  const mapUrl = useMemo(() => {
    const lat = pickupCoordinate.latitude;
    const lng = pickupCoordinate.longitude;

    const left = lng - 0.015;
    const right = lng + 0.015;
    const bottom = lat - 0.015;
    const top = lat + 0.015;

    return (
      "https://www.openstreetmap.org/export/embed.html" +
      `?bbox=${left}%2C${bottom}%2C${right}%2C${top}` +
      `&layer=mapnik` +
      `&marker=${lat}%2C${lng}`
    );
  }, [pickupCoordinate]);

  return (
    <View style={styles.container}>
      <WebView
        source={{ uri: mapUrl }}
        style={styles.map}
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
  },
});