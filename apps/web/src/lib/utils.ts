import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function shortAddress(address: string, prefix = 4, suffix = 4) {
  if (!address) return "";
  if (address.length <= prefix + suffix) return address;
  return `${address.slice(0, prefix)}…${address.slice(-suffix)}`;
}

export function formatNumber(n: number) {
  return new Intl.NumberFormat("en-US").format(n);
}

export function formatPercent(basisPoints: number) {
  return `${(basisPoints / 100).toFixed(2)}%`;
}
