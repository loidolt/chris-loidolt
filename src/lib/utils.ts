import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type { ClassValue };

// Re-export type utilities for shadcn components
export type WithElementRef<T> = T & { ref?: any };
export type WithoutChild<T> = Omit<T, 'child' | 'children'>;
