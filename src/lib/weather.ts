export type Coordinates = {
  latitude: number;
  longitude: number;
};

export function buildForecastUrl({ latitude, longitude }: Coordinates) {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("current", "temperature_2m,weather_code");
  url.searchParams.set("temperature_unit", "celsius");
  url.searchParams.set("timezone", "auto");
  return url.toString();
}

export function buildReverseGeocodeUrl({ latitude, longitude }: Coordinates) {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/reverse");
  url.searchParams.set("latitude", String(latitude));
  url.searchParams.set("longitude", String(longitude));
  url.searchParams.set("count", "1");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");
  return url.toString();
}
