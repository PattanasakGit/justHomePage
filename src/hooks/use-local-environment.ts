"use client";

import { useEffect, useMemo, useState } from "react";
type LocalWeatherResponse = {
  temperatureC: number | null;
  locationLabel: string;
  timezone: string | null;
};

export type LocalEnvironment = {
  dateLabel: string;
  greeting: string;
  locationLabel: string;
  status: "idle" | "locating" | "ready" | "blocked" | "error";
  temperatureC: number | null;
  timezone: string;
};

function getGreeting(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function useLocalEnvironment(): LocalEnvironment {
  const [now, setNow] = useState(() => new Date());
  const [status, setStatus] = useState<LocalEnvironment["status"]>("idle");
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [locationLabel, setLocationLabel] = useState("Sync location");
  const [resolvedTimezone, setResolvedTimezone] = useState<string | null>(null);
  const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setStatus("blocked");
      setLocationLabel("Location unavailable");
      return;
    }

    let cancelled = false;
    setStatus("locating");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const coordinates = {
            latitude: Number(position.coords.latitude.toFixed(4)),
            longitude: Number(position.coords.longitude.toFixed(4)),
          };
          const params = new URLSearchParams({
            lat: String(coordinates.latitude),
            lon: String(coordinates.longitude),
          });
          const response = await fetch(`/api/local-weather?${params.toString()}`);
          if (!response.ok) throw new Error("weather unavailable");
          const localWeather = (await response.json()) as LocalWeatherResponse;

          if (cancelled) return;

          setTemperatureC(localWeather.temperatureC);
          setResolvedTimezone(localWeather.timezone);
          setLocationLabel(localWeather.locationLabel);
          setStatus("ready");
        } catch {
          if (!cancelled) {
            setStatus("error");
            setLocationLabel("Weather unavailable");
          }
        }
      },
      () => {
        if (!cancelled) {
          setStatus("blocked");
          setLocationLabel("Allow location for weather");
        }
      },
      { enableHighAccuracy: false, maximumAge: 10 * 60 * 1000, timeout: 8000 },
    );

    return () => {
      cancelled = true;
    };
  }, []);

  return useMemo(
    () => ({
      dateLabel: new Intl.DateTimeFormat(undefined, {
        weekday: "long",
        month: "short",
        day: "numeric",
        timeZone: resolvedTimezone ?? browserTimezone,
      }).format(now),
      greeting: getGreeting(now.getHours()),
      locationLabel,
      status,
      temperatureC,
      timezone: resolvedTimezone ?? browserTimezone,
    }),
    [browserTimezone, locationLabel, now, resolvedTimezone, status, temperatureC],
  );
}
