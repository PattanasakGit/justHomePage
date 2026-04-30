import { NextRequest, NextResponse } from "next/server";
import { buildForecastUrl, buildReverseGeocodeUrl } from "@/lib/weather";

type WeatherResponse = {
  current?: {
    temperature_2m?: number;
  };
};

type ReverseGeocodeResponse = {
  results?: Array<{
    name?: string;
    admin1?: string;
    country_code?: string;
    timezone?: string;
  }>;
};

export async function GET(request: NextRequest) {
  const latitude = Number(request.nextUrl.searchParams.get("lat"));
  const longitude = Number(request.nextUrl.searchParams.get("lon"));

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const coordinates = { latitude, longitude };

  try {
    const [weatherResponse, placeResponse] = await Promise.all([
      fetch(buildForecastUrl(coordinates), { signal: AbortSignal.timeout(6000) }).then(
        (response) => response.json() as Promise<WeatherResponse>,
      ),
      fetch(buildReverseGeocodeUrl(coordinates), { signal: AbortSignal.timeout(6000) }).then(
        (response) => response.json() as Promise<ReverseGeocodeResponse>,
      ),
    ]);
    const place = placeResponse.results?.[0];

    return NextResponse.json({
      temperatureC:
        typeof weatherResponse.current?.temperature_2m === "number"
          ? Math.round(weatherResponse.current.temperature_2m)
          : null,
      locationLabel: place?.name
        ? [place.name, place.admin1 ?? place.country_code].filter(Boolean).join(", ")
        : "Local position",
      timezone: place?.timezone ?? null,
    });
  } catch {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 502 });
  }
}
