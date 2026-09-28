import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { t, vehicleClasses } from "./i18n";
import {
  defaultSettings,
  formatDuration,
  formatMoney,
  hoursCharged,
  isSameDay,
  newId,
  normalizePlate,
  parkingFee,
} from "./logic";
import { downloadCsv, loadStore, saveStore } from "./storage";
import type {
  DeskMode,
  Lang,
  ParkingSession,
  PaymentMethod,
  SiteSettings,
  Store,
  VehicleClass,
} from "./types";

type Tab = DeskMode | "reports" | "setup";

const payments: PaymentMethod[] = ["cash", "upi", "card"];

export default function App() {
  const [store, setStore] = useState<Store>(() =>
    typeof localStorage === "undefined"
      ? { settings: defaultSettings, parking: [], toll: [] }
      : loadStore(),
  );
  const [tab, setTab] = useState<Tab>("parking");
  const [toast, setToast] = useState("");

  useEffect(() => {
    saveStore(store);
  }, [store]);

  const lang = store.settings.lang;
  const txt = t(lang);
  const modes = store.settings.enabledModes;
  const activeTab = tab === "parking" || tab === "toll" ? (modes.includes(tab) ? tab : modes[0] ?? "setup") : tab;

  const parkingToday = store.parking.filter((s) => isSameDay(s.enteredAt));
  const tollToday = store.toll.filter((s) => isSameDay(s.at));
  const inside = store.parking.filter((s) => s.status === "inside");
  const collected =
    parkingToday.reduce((sum, s) => sum + (s.amount ?? 0), 0) +
    tollToday.reduce((sum, s) => sum + s.amount, 0);

  function flash(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  }

  return (
    <div className="app">
      <header className="top">
        <div className="brand">
          <h1>{store.settings.siteName}</h1>
          <p>{txt.appTag}</p>
        </div>
        <select
          className="lang"
          value={lang}
          onChange={(e) =>
            setStore((prev) => ({
              ...prev,
              settings: { ...prev.settings, lang: e.target.value as Lang },
            }))
          }
          aria-label={txt.language}
        >
          <option value="hi">हिंदी</option>
          <option value="en">English</option>
        </select>
      </header>

      <div className="banner">
        <strong>{txt.hardwareAlt}</strong>
        <div>{txt.noHardware}</div>
      </div>

      <section className="stats">
        <div className="stat">
          <span>{txt.occupancy}</span>
          <strong>{inside.length}</strong>
        </div>
        <div className="stat">
          <span>{txt.today}</span>
          <strong>{parkingToday.length + tollToday.length}</strong>
        </div>
        <div className="stat">
          <span>{txt.collected}</span>
          <strong>{formatMoney(collected, store.settings.currency)}</strong>
        </div>
      </section>

      {toast ? <p className="toast">{toast}</p> : null}

      {activeTab === "parking" ? (
        <ParkingDesk store={store} setStore={setStore} flash={flash} />
      ) : null}
      {activeTab === "toll" ? (
        <TollDesk store={store} setStore={setStore} flash={flash} />
      ) : null}
      {activeTab === "reports" ? <Reports store={store} /> : null}
      {activeTab === "setup" ? (
        <Setup
          settings={store.settings}
          onSave={(settings) => {
            setStore((prev) => ({ ...prev, settings }));
            flash(t(settings.lang).saved);
          }}
        />
      ) : null}

      <nav className="tabs">
        {modes.includes("parking") ? (
          <button className={`tab ${activeTab === "parking" ? "active" : ""}`} onClick={() => setTab("parking")}>
            {txt.parking}
          </button>
        ) : null}
        {modes.includes("toll") ? (
          <button className={`tab ${activeTab === "toll" ? "active" : ""}`} onClick={() => setTab("toll")}>
            {txt.toll}
          </button>
        ) : null}
        <button className={`tab ${activeTab === "reports" ? "active" : ""}`} onClick={() => setTab("reports")}>
          {txt.reports}
        </button>
        <button className={`tab ${activeTab === "setup" ? "active" : ""}`} onClick={() => setTab("setup")}>
          {txt.setup}
        </button>
      </nav>
    </div>
  );
}

function ParkingDesk({
  store,
  setStore,
  flash,
}: {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  flash: (msg: string) => void;
}) {
  const txt = t(store.settings.lang);
  const [plate, setPlate] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>("car");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<ParkingSession | null>(null);
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const [query, setQuery] = useState("");

  const inside = store.parking.filter((s) => s.status === "inside");
  const filtered = inside.filter((s) => {
    const q = normalizePlate(query);
    if (!q) return true;
    return normalizePlate(s.plate).includes(q) || s.id.includes(query.toUpperCase());
  });

  function enterVehicle() {
    const clean = normalizePlate(plate);
    if (!clean) {
      setError(txt.requiredPlate);
      return;
    }
    if (inside.some((s) => s.plate === clean)) {
      setError(txt.duplicateInside);
      return;
    }
    const session: ParkingSession = {
      id: newId("P"),
      plate: clean,
      vehicleClass,
      phone: phone || undefined,
      enteredAt: new Date().toISOString(),
      status: "inside",
    };
    setStore((prev) => ({ ...prev, parking: [session, ...prev.parking] }));
    setSelected(session);
    setPlate("");
    setPhone("");
    setError("");
    flash(`${txt.ticket} ${session.id}`);
  }

  function closeSelected() {
    if (!selected) return;
    const exitedAt = new Date().toISOString();
    const amount = parkingFee(selected.vehicleClass, selected.enteredAt, exitedAt, store.settings);
    setStore((prev) => ({
      ...prev,
      parking: prev.parking.map((s) =>
        s.id === selected.id ? { ...s, exitedAt, amount, payment, status: "closed" } : s,
      ),
    }));
    setSelected(null);
    flash(`${txt.collected} ${formatMoney(amount, store.settings.currency)}`);
  }

  const preview = selected
    ? parkingFee(selected.vehicleClass, selected.enteredAt, new Date().toISOString(), store.settings)
    : 0;

  return (
    <>
      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          enterVehicle();
        }}
      >
        <label>
          {txt.plate}
          <input
            value={plate}
            onChange={(e) => setPlate(e.target.value)}
            placeholder={txt.platePlaceholder}
            autoCapitalize="characters"
          />
        </label>
        <div className="row">
          <label>
            {txt.vehicle}
            <select value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value as VehicleClass)}>
              {vehicleClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {txt[cls]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {txt.phone}
            <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" />
          </label>
        </div>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn primary" type="submit">
          {txt.enter}
        </button>
      </form>

      {selected ? (
        <article className="card ticket">
          <h2>
            {txt.ticket} {selected.id}
          </h2>
          <div className="plate">{selected.plate}</div>
          <p className="muted">
            {txt[selected.vehicleClass]} · {new Date(selected.enteredAt).toLocaleString()}
          </p>
          <p>
            {txt.duration}: {formatDuration(selected.enteredAt, new Date().toISOString(), txt.hours, txt.minutes)} (
            {hoursCharged(selected.enteredAt, new Date().toISOString())} {txt.hours})
          </p>
          <p>
            {txt.amount}: <strong>{formatMoney(preview, store.settings.currency)}</strong>
          </p>
          <label>
            {txt.method}
            <select value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
              {payments.map((p) => (
                <option key={p} value={p}>
                  {txt[p]}
                </option>
              ))}
            </select>
          </label>
          <div className="actions" style={{ marginTop: 10 }}>
            <button className="btn good" type="button" onClick={closeSelected}>
              {txt.closeTicket}
            </button>
            <button className="btn ghost" type="button" onClick={() => window.print()}>
              {txt.print}
            </button>
          </div>
        </article>
      ) : null}

      <section className="card form">
        <strong>{txt.insideNow}</strong>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={txt.search} />
        {filtered.length === 0 ? <p className="muted">{txt.emptyInside}</p> : null}
        <div className="list">
          {filtered.map((s) => (
            <div className="item card" key={s.id}>
              <div>
                <div className="plate">{s.plate}</div>
                <div className="muted">
                  {s.id} · {txt[s.vehicleClass]}
                </div>
              </div>
              <button className="btn ghost" type="button" onClick={() => setSelected(s)}>
                {txt.exit}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function TollDesk({
  store,
  setStore,
  flash,
}: {
  store: Store;
  setStore: Dispatch<SetStateAction<Store>>;
  flash: (msg: string) => void;
}) {
  const txt = t(store.settings.lang);
  const [plate, setPlate] = useState("");
  const [vehicleClass, setVehicleClass] = useState<VehicleClass>("car");
  const [payment, setPayment] = useState<PaymentMethod>("cash");
  const amount = store.settings.tollRates[vehicleClass];

  function collect() {
    const clean = normalizePlate(plate);
    if (!clean) {
      flash(txt.requiredPlate);
      return;
    }
    setStore((prev) => ({
      ...prev,
      toll: [
        {
          id: newId("T"),
          plate: clean,
          vehicleClass,
          amount,
          payment,
          at: new Date().toISOString(),
        },
        ...prev.toll,
      ],
    }));
    setPlate("");
    flash(`${txt.collected} ${formatMoney(amount, store.settings.currency)}`);
  }

  const today = store.toll.filter((s) => isSameDay(s.at)).slice(0, 12);

  return (
    <>
      <form
        className="card form"
        onSubmit={(e) => {
          e.preventDefault();
          collect();
        }}
      >
        <label>
          {txt.plate}
          <input value={plate} onChange={(e) => setPlate(e.target.value)} placeholder={txt.platePlaceholder} />
        </label>
        <div className="row">
          <label>
            {txt.vehicle}
            <select value={vehicleClass} onChange={(e) => setVehicleClass(e.target.value as VehicleClass)}>
              {vehicleClasses.map((cls) => (
                <option key={cls} value={cls}>
                  {txt[cls]}
                </option>
              ))}
            </select>
          </label>
          <label>
            {txt.method}
            <select value={payment} onChange={(e) => setPayment(e.target.value as PaymentMethod)}>
              {payments.map((p) => (
                <option key={p} value={p}>
                  {txt[p]}
                </option>
              ))}
            </select>
          </label>
        </div>
        <p>
          {txt.flatFee}: <strong>{formatMoney(amount, store.settings.currency)}</strong>
        </p>
        <button className="btn primary" type="submit">
          {txt.collect}
        </button>
      </form>
      <section className="card form">
        <strong>{txt.tollToday}</strong>
        {today.length === 0 ? <p className="muted">{txt.noneToday}</p> : null}
        <div className="list">
          {today.map((row) => (
            <div className="item" key={row.id}>
              <div>
                <div className="plate">{row.plate}</div>
                <div className="muted">
                  {txt[row.vehicleClass]} · {txt[row.payment]}
                </div>
              </div>
              <strong>{formatMoney(row.amount, store.settings.currency)}</strong>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Reports({ store }: { store: Store }) {
  const txt = t(store.settings.lang);
  const parkingToday = useMemo(() => store.parking.filter((s) => isSameDay(s.enteredAt)), [store.parking]);
  const tollToday = useMemo(() => store.toll.filter((s) => isSameDay(s.at)), [store.toll]);
  const parkingSum = parkingToday.reduce((sum, s) => sum + (s.amount ?? 0), 0);
  const tollSum = tollToday.reduce((sum, s) => sum + s.amount, 0);

  function exportAll() {
    downloadCsv(`saepl-shift-${new Date().toISOString().slice(0, 10)}.csv`, [
      ["type", "id", "plate", "class", "amount", "payment", "time"],
      ...parkingToday.map((s) => [
        "parking",
        s.id,
        s.plate,
        s.vehicleClass,
        String(s.amount ?? 0),
        s.payment ?? "",
        s.exitedAt ?? s.enteredAt,
      ]),
      ...tollToday.map((s) => ["toll", s.id, s.plate, s.vehicleClass, String(s.amount), s.payment, s.at]),
    ]);
  }

  return (
    <section className="card form">
      <strong>{txt.shiftReport}</strong>
      <p>
        {txt.parkingToday}: {parkingToday.length} · {formatMoney(parkingSum, store.settings.currency)}
      </p>
      <p>
        {txt.tollToday}: {tollToday.length} · {formatMoney(tollSum, store.settings.currency)}
      </p>
      <button className="btn ghost" type="button" onClick={exportAll}>
        {txt.exportCsv}
      </button>
      <div style={{ overflowX: "auto" }}>
        <table>
          <thead>
            <tr>
              <th>{txt.ticket}</th>
              <th>{txt.plate}</th>
              <th>{txt.amount}</th>
              <th>{txt.method}</th>
            </tr>
          </thead>
          <tbody>
            {parkingToday.length + tollToday.length === 0 ? (
              <tr>
                <td colSpan={4} className="muted">
                  {txt.noneToday}
                </td>
              </tr>
            ) : null}
            {parkingToday.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.plate}</td>
                <td>{s.amount ?? "—"}</td>
                <td>{s.payment ? txt[s.payment] : txt.statusInside}</td>
              </tr>
            ))}
            {tollToday.map((s) => (
              <tr key={s.id}>
                <td>{s.id}</td>
                <td>{s.plate}</td>
                <td>{s.amount}</td>
                <td>{txt[s.payment]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Setup({
  settings,
  onSave,
}: {
  settings: SiteSettings;
  onSave: (settings: SiteSettings) => void;
}) {
  const [draft, setDraft] = useState(settings);
  const txt = t(draft.lang);

  function toggleMode(mode: DeskMode, on: boolean) {
    const enabled = on
      ? Array.from(new Set([...draft.enabledModes, mode]))
      : draft.enabledModes.filter((m) => m !== mode);
    setDraft({ ...draft, enabledModes: enabled.length ? enabled : draft.enabledModes });
  }

  return (
    <form
      className="card form"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(draft);
      }}
    >
      <label>
        {txt.siteName}
        <input value={draft.siteName} onChange={(e) => setDraft({ ...draft, siteName: e.target.value })} />
      </label>
      <div className="row">
        <label>
          {txt.currency}
          <select
            value={draft.currency}
            onChange={(e) => setDraft({ ...draft, currency: e.target.value as SiteSettings["currency"] })}
          >
            <option value="INR">INR ₹</option>
            <option value="AED">AED</option>
          </select>
        </label>
        <label>
          {txt.language}
          <select value={draft.lang} onChange={(e) => setDraft({ ...draft, lang: e.target.value as Lang })}>
            <option value="hi">हिंदी</option>
            <option value="en">English</option>
          </select>
        </label>
      </div>
      <div className="row">
        <label>
          <input
            type="checkbox"
            checked={draft.enabledModes.includes("parking")}
            onChange={(e) => toggleMode("parking", e.target.checked)}
          />{" "}
          {txt.enableParking}
        </label>
        <label>
          <input
            type="checkbox"
            checked={draft.enabledModes.includes("toll")}
            onChange={(e) => toggleMode("toll", e.target.checked)}
          />{" "}
          {txt.enableToll}
        </label>
      </div>
      <strong>{txt.parking}</strong>
      <div className="rates">
        {vehicleClasses.map((cls) => (
          <div className="rate-row" key={cls}>
            <span>{txt[cls]}</span>
            <label>
              {txt.firstHour}
              <input
                type="number"
                min={0}
                value={draft.parkingRates[cls].firstHour}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    parkingRates: {
                      ...draft.parkingRates,
                      [cls]: { ...draft.parkingRates[cls], firstHour: Number(e.target.value) },
                    },
                  })
                }
              />
            </label>
            <label>
              {txt.extraHour}
              <input
                type="number"
                min={0}
                value={draft.parkingRates[cls].extraHour}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    parkingRates: {
                      ...draft.parkingRates,
                      [cls]: { ...draft.parkingRates[cls], extraHour: Number(e.target.value) },
                    },
                  })
                }
              />
            </label>
          </div>
        ))}
      </div>
      <strong>{txt.toll}</strong>
      <div className="rates">
        {vehicleClasses.map((cls) => (
          <label key={cls}>
            {txt[cls]} — {txt.flatFee}
            <input
              type="number"
              min={0}
              value={draft.tollRates[cls]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  tollRates: { ...draft.tollRates, [cls]: Number(e.target.value) },
                })
              }
            />
          </label>
        ))}
      </div>
      <button className="btn primary" type="submit">
        {txt.save}
      </button>
    </form>
  );
}
