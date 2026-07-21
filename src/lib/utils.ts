import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type RiskLevel = "alto" | "medio" | "bajo";
export type HazardType = "sismo" | "inundacion" | "sequia";

export interface Building {
  id: string;
  name: string;
  address: string;
  sectorId: string;
  sectorName: string;
  lat: number;
  lng: number;
  riskLevel: RiskLevel;
  buildingType: string;
  floors: number;
  units: number;
  yearBuilt: number;
  post16aReportId: string;
  vulnerabilities: string[];
  safeMeetingPoint: string;
  evacuationNotes: string;
}

export interface FamilyProfile {
  householdSize: number;
  housingType: string;
  hasElderly: boolean;
  hasChildren: boolean;
  hasDisability: boolean;
  hazardType: HazardType;
}

export interface PlanSection {
  title: string;
  items: string[];
}

export interface FamilyPlan {
  id: string;
  buildingId: string;
  buildingName: string;
  sectorId: string;
  sectorName: string;
  riskLevel: RiskLevel;
  hazardType: HazardType;
  meetingPoint: string;
  evacuationRoute: string;
  before: PlanSection;
  during: PlanSection;
  after: PlanSection;
  sources: { title: string; excerpt: string }[];
  generatedAt: string;
  familySummary: string;
}

export interface SectorStat {
  sectorId: string;
  sectorName: string;
  totalHouseholds: number;
  householdsWithPlan: number;
  percent: number;
}

export function riskLabel(level: RiskLevel): string {
  return level === "alto" ? "Alto" : level === "medio" ? "Medio" : "Bajo";
}

export function hazardLabel(h: HazardType): string {
  if (h === "sismo") return "Sismo";
  if (h === "inundacion") return "Inundación";
  return "Sequía";
}
