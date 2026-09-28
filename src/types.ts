export type Lang = "hi" | "en";
export type DeskMode = "parking" | "toll";
export type VehicleClass = "two_wheeler" | "car" | "suv" | "truck" | "bus";
export type PaymentMethod = "cash" | "upi" | "card";

export type ParkingSession = {
  id: string;
  plate: string;
  vehicleClass: VehicleClass;
  phone?: string;
  enteredAt: string;
  exitedAt?: string;
  amount?: number;
  payment?: PaymentMethod;
  status: "inside" | "closed";
};

export type TollPassage = {
  id: string;
  plate: string;
  vehicleClass: VehicleClass;
  amount: number;
  payment: PaymentMethod;
  at: string;
};

export type SiteSettings = {
  siteName: string;
  currency: "INR" | "AED";
  lang: Lang;
  enabledModes: DeskMode[];
  parkingRates: Record<VehicleClass, { firstHour: number; extraHour: number }>;
  tollRates: Record<VehicleClass, number>;
};

export type Store = {
  settings: SiteSettings;
  parking: ParkingSession[];
  toll: TollPassage[];
};
