import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a byte number into a human-readable size string (e.g., 1.4 MB).
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Truncates a SHA-256 digest for display in clean UI tables.
 */
export function formatSha256(digest: string, prefixLen = 8, suffixLen = 6): string {
  if (!digest || digest.length <= prefixLen + suffixLen) return digest;
  return `${digest.slice(0, prefixLen)}...${digest.slice(-suffixLen)}`;
}

/**
 * Calculates total Reproducibility Debt (RpD) from array of impact factors.
 */
export function calculateRpD(factors: { impact: number }[]): number {
  const total = factors.reduce((sum, f) => sum + f.impact, 0);
  return Number(Math.min(1.0, total).toFixed(2));
}

/**
 * Validates semver compatibility between contract versions.
 */
export function isContractCompatible(requiredVer: string, providedVer: string): boolean {
  if (requiredVer === providedVer) return true;
  const reqMajor = requiredVer.split(".")[0];
  const provMajor = providedVer.split(".")[0];
  return reqMajor === provMajor;
}
