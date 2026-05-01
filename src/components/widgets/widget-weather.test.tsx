import { describe, expect, it, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";
import type { LocalEnvironment } from "@/hooks/use-local-environment";

const envState: { current: LocalEnvironment } = {
  current: {
    dateLabel: "Wed, May 1",
    greeting: "Good afternoon",
    locationLabel: "San Francisco",
    status: "ready",
    temperatureC: 18,
    timezone: "America/Los_Angeles",
  },
};

vi.mock("@/hooks/use-local-environment", () => ({
  useLocalEnvironment: () => envState.current,
}));

import { WidgetWeather } from "@/components/widgets/widget-weather";

beforeEach(() => {
  envState.current = {
    dateLabel: "Wed, May 1",
    greeting: "Good afternoon",
    locationLabel: "San Francisco",
    status: "ready",
    temperatureC: 18,
    timezone: "America/Los_Angeles",
  };
});

describe("WidgetWeather error/blocked footer replacement", () => {
  it("replaces the footer line with a single role=status element on error (not appended)", () => {
    envState.current = {
      ...envState.current,
      status: "error",
      temperatureC: null,
      locationLabel: "Weather unavailable",
    };

    const { container, getAllByRole } = render(<WidgetWeather size="compact" />);
    // exactly ONE status node (the footer-in-place replacement)
    const statuses = getAllByRole("status");
    expect(statuses.length).toBe(1);
    expect(statuses[0].textContent ?? "").toMatch(/sky|unavailable|reach/i);
    // and there must NOT be an additional appended muted line at the bottom
    // (i.e. the footer slot was replaced, not duplicated).
    const dataFooters = container.querySelectorAll("[data-testid='weather-footer']");
    expect(dataFooters.length).toBe(1);
  });

  it("replaces the footer with the blocked message when geolocation is denied", () => {
    envState.current = {
      ...envState.current,
      status: "blocked",
      temperatureC: null,
      locationLabel: "Allow location for weather",
    };

    const { getAllByRole, container } = render(<WidgetWeather size="compact" />);
    const statuses = getAllByRole("status");
    expect(statuses.length).toBe(1);
    expect(statuses[0].textContent ?? "").toMatch(/allow location/i);
    const dataFooters = container.querySelectorAll("[data-testid='weather-footer']");
    expect(dataFooters.length).toBe(1);
  });

  it("uses the regular MapPin footer when status is ready", () => {
    const { container, queryAllByRole } = render(<WidgetWeather size="compact" />);
    expect(queryAllByRole("status").length).toBe(0);
    const dataFooters = container.querySelectorAll("[data-testid='weather-footer']");
    expect(dataFooters.length).toBe(1);
  });
});
