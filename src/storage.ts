import { defaultSettings } from "./logic";
import type { Store } from "./types";

const KEY = "saepl-desk-v1";

export function loadStore(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyStore();
    const parsed = JSON.parse(raw) as Store;
    return {
      settings: { ...defaultSettings, ...parsed.settings },
      parking: parsed.parking ?? [],
      toll: parsed.toll ?? [],
    };
  } catch {
    return emptyStore();
  }
}

export function saveStore(store: Store): void {
  localStorage.setItem(KEY, JSON.stringify(store));
}

export function emptyStore(): Store {
  return {
    settings: defaultSettings,
    parking: [],
    toll: [],
  };
}

export function downloadCsv(filename: string, rows: string[][]): void {
  const body = rows
    .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([body], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
