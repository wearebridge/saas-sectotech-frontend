import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (cents: number | string | null | undefined) => {
  const numericValue = typeof cents === "string" ? parseInt(cents, 10) : cents;
  if (!numericValue || isNaN(numericValue)) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericValue / 100);
};

export const formatInterval = (interval?: string) => {
  switch (interval) {
    case "month":
      return "/mês";
    case "year":
      return "/ano";
    case "week":
      return "/semana";
    case "day":
      return "/dia";
    default:
      return "";
  }
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};
