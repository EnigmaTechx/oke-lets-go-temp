import React, { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

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
  const [driverCoordinate, setDriverCoordinate] =
    useState<MapCoordinate | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    const watchId = navigator.geolocation.watchPosition(
      (position) =>
        setDriverCoordinate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      () => undefined,
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 15000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const mapUrl = useMemo(() => {
    if (driverCoordinate) {
      return (
        "https://www.google.com/maps?output=embed&saddr=" +
        encodeURIComponent(
          `${driverCoordinate.latitude},${driverCoordinate.longitude}`,
        ) +
        "&daddr=" +
        encodeURIComponent(
          `${pickupCoordinate.latitude},${pickupCoordinate.longitude}`,
        )
      );
    }
    return (
      "https://www.google.com/maps?output=embed&q=" +
      encodeURIComponent(
        `${pickupCoordinate.latitude},${pickupCoordinate.longitude}`,
      ) +
      "&z=15"
    );
  }, [driverCoordinate, pickupCoordinate]);

  return (
    <View style={styles.container}>
      {React.createElement("iframe", {
        allowFullScreen: true,
        "aria-label": "Live Google Map to passenger pickup",
        src: mapUrl,
        style: {
          border: 0,
          height: "100%",
          left: 0,
          position: "absolute",
          top: 0,
          width: "100%",
        },
      })}
      {!driverCoordinate && (
        <View pointerEvents="none" style={styles.mapMessage}>
          <Text style={styles.mapMessageText}>
            Allow location access for live driver positioning.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#131D2E",
    flex: 1,
    overflow: "hidden",
  },
  mapMessage: {
    backgroundColor: "rgba(11,18,32,0.9)",
    borderRadius: 12,
    left: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    position: "absolute",
    right: 14,
    top: 14,
  },
  mapMessageText: {
    color: "#F8FAFC",
    fontSize: 12,
    lineHeight: 16,
    textAlign: "center",
  },
});
