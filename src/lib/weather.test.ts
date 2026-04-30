import { describe, expect, it } from "vitest";
import { buildForecastUrl } from "./weather";

describe("weather helpers", () => {
  it("requests current temperature in celsius with automatic timezone", () => {
    const url = buildForecastUrl({ latitude: 13.7563, longitude: 100.5018 });

    expect(url).toContain("latitude=13.7563");
    expect(url).toContain("longitude=100.5018");
    expect(url).toContain("current=temperature_2m%2Cweather_code");
    expect(url).toContain("temperature_unit=celsius");
    expect(url).toContain("timezone=auto");
  });
});
