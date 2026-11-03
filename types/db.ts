export type VehicleStatus = 'draft' | 'in_stock' | 'reserved' | 'sold';
export type BodyType = 'hatchback' | 'sedan' | 'suv' | 'bakkie' | 'coupe' | 'mpv' | 'other';
export type FuelType = 'petrol' | 'diesel' | 'hybrid' | 'electric';
export type Transmission = 'manual' | 'auto';
export type Drivetrain = '2wd' | '4x4' | 'awd';
export type EnquiryKind = 'enquiry' | 'test_drive' | 'reserve' | 'finance' | 'trade_in' | 'contact';
export type EnquiryStatus = 'new' | 'contacted' | 'won' | 'lost';
export type Role = 'none' | 'sales' | 'admin';

export interface VehicleImage {
  id: string;
  vehicle_id: string;
  storage_path: string;
  position: number;
  is_primary: boolean;
}

export interface Vehicle {
  id: string;
  slug: string;
  stock_no: string | null;
  make: string;
  model: string;
  variant: string | null;
  year: number;
  body: BodyType;
  fuel: FuelType;
  transmission: Transmission;
  drivetrain: Drivetrain | null;
  mileage_km: number | null;
  colour: string | null;
  price_zar: number | null;
  status: VehicleStatus;
  featured: boolean;
  description: string | null;
  features: string[];
  sold_at: string | null;
  created_at: string;
  updated_at: string;
  vehicle_images?: VehicleImage[];
}

export interface Enquiry {
  id: string;
  vehicle_id: string | null;
  kind: EnquiryKind;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  preferred_date: string | null;
  status: EnquiryStatus;
  created_at: string;
  vehicles?: Pick<Vehicle, 'make' | 'model' | 'year' | 'slug' | 'stock_no'> | null;
}

export const BODY_LABEL: Record<BodyType, string> = {
  hatchback: 'Hatchback', sedan: 'Sedan', suv: 'SUV', bakkie: 'Bakkie', coupe: 'Coupé', mpv: 'MPV', other: 'Other',
};
export const FUEL_LABEL: Record<FuelType, string> = { petrol: 'Petrol', diesel: 'Diesel', hybrid: 'Hybrid', electric: 'Electric' };
export const TRANS_LABEL: Record<Transmission, string> = { manual: 'Manual', auto: 'Automatic' };
export const DRIVE_LABEL: Record<Drivetrain, string> = { '2wd': '2WD', '4x4': '4x4', awd: 'AWD' };
export const STATUS_LABEL: Record<VehicleStatus, string> = { draft: 'Draft', in_stock: 'In stock', reserved: 'Reserved', sold: 'Sold' };
export const KIND_LABEL: Record<EnquiryKind, string> = {
  enquiry: 'Enquiry', test_drive: 'Test drive', reserve: 'Reservation', finance: 'Finance', trade_in: 'Trade-in', contact: 'Contact',
};
export const ENQ_STATUS_LABEL: Record<EnquiryStatus, string> = { new: 'New', contacted: 'Contacted', won: 'Won', lost: 'Lost' };
