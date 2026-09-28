import { describe, expect, it } from "vitest";
import {
  hoursCharged,
  normalizePlate,
  parkingFee,
  defaultSettings,
} from "./logic";

describe("normalizePlate", () => {
  it("strips spaces and dashes", () => {
    expect(normalizePlate("mh-12 ab 1234")).toBe("MH12AB1234");
  });
});

describe("hoursCharged", () => {
  it("charges at least one hour", () => {
    expect(hoursCharged("2026-09-28T10:00:00", "2026-09-28T10:12:00")).toBe(1);
  });

  it("rounds partial extra hours up", () => {
    expect(hoursCharged("2026-09-28T10:00:00", "2026-09-28T11:01:00")).toBe(2);
  });
});

describe("parkingFee", () => {
  it("uses first-hour rate under 60 minutes", () => {
    expect(
      parkingFee("car", "2026-09-28T10:00:00", "2026-09-28T10:40:00", defaultSettings),
    ).toBe(40);
  });

  it("adds extra hours after the first", () => {
    expect(
      parkingFee("car", "2026-09-28T10:00:00", "2026-09-28T12:10:00", defaultSettings),
    ).toBe(80);
  });
});
