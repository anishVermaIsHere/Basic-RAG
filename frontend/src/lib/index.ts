import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";


export const cn = (...x: ClassValue[]) => twMerge(clsx(x));

export const bytes = (n: number) => {
  let u = ["B", "KB", "MB", "GB"],
    i = 0;
  while (n >= 1024 && i < 3) {
    n /= 1024;
    i++;
  }
  return `${n.toFixed(i ? 1 : 0)} ${u[i]}`;
};

export const date = (x: string) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(x));
