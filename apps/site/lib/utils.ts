import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui class-composition helper (own-the-code, MIT). Merges conditional classes (clsx) and
 * resolves Tailwind conflicts (tailwind-merge). Both deps are pinned exact in package.json.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
