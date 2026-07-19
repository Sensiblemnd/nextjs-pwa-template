"use client";

export interface GeoPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
}

export async function getCurrentPosition(): Promise<GeoPosition> {
  if (!("geolocation" in navigator)) throw new Error("NOT_SUPPORTED");

  // Prevents re-prompting on Firefox Android when permission was already granted.
  // When state is "granted", getCurrentPosition() fires silently without a dialog.
  if ("permissions" in navigator) {
    const status = await navigator.permissions.query({ name: "geolocation" });
    if (status.state === "denied") throw new Error("1");
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        }),
      (err) => reject(new Error(err.code.toString())),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 60_000 }
    );
  });
}
