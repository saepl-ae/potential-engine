import type { ParkingSession, SiteSettings, VehicleClass } from "./types";

export const defaultSettings: SiteSettings = {
  siteName: "SAEPL Site",
  currency: "INR",
  lang: "hi",
  enabledModes: ["parking", "toll"],
  parkingRates: {
    two_wheeler: { firstHour: 20, extraHour: 10 },
    car: { firstHour: 40, extraHour: 20 },
    suv: { firstHour: 50, extraHour: 25 },
    truck: { firstHour: 80, extraHour: 40 },
    bus: { firstHour: 60, extraHour: 30 },
  },
  tollRates: {
    two_wheeler: 20,
    car: 50,
    suv: 70,
    truck: 120,
    bus: 100,
  },
};

export function normalizePlate(plate: string): string {
  return plate.toUpperCase().replace(/[^A-Z0-9]/g, "");
}

export function newId(prefix: string): string {
  const n = Math.floor(Math.random() * 1_000_000)
    .toString()
    .padStart(6, "0");
  return `${prefix}-${n}`;
}

export function hoursCharged(enteredAt: string, exitedAt: string): number {
  const ms = new Date(exitedAt).getTime() - new Date(enteredAt).getTime();
  const hours = ms / (1000 * 60 * 60);
  return Math.max(1, Math.ceil(hours));
}

export function parkingFee(
  vehicleClass: VehicleClass,
  enteredAt: string,
  exitedAt: string,
  settings: SiteSettings,
): number {
  const hours = hoursCharged(enteredAt, exitedAt);
  const rate = settings.parkingRates[vehicleClass];
  if (hours <= 1) return rate.firstHour;
  return rate.firstHour + (hours - 1) * rate.extraHour;
}

export function formatDuration(enteredAt: string, exitedAt: string, hourLabel: string, minLabel: string): string {
  const ms = Math.max(0, new Date(exitedAt).getTime() - new Date(enteredAt).getTime());
  const totalMin = Math.floor(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h === 0) return `${m} ${minLabel}`;
  return `${h} ${hourLabel} ${m} ${minLabel}`;
}

export function formatMoney(amount: number, currency: SiteSettings["currency"]): string {
  const symbol = currency === "AED" ? "AED" : "₹";
  return `${symbol} ${amount}`;
}

export function isSameDay(iso: string, now = new Date()): boolean {
  const d = new Date(iso);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export function ticketText(session: ParkingSession, siteName: string): string {
  return [
    siteName,
    `Ticket ${session.id}`,
    session.plate,
    new Date(session.enteredAt).toLocaleString(),
  ].join(" · ");
}
