import { Loader2Icon } from "lucide-react";

interface LoaderProps {
  size?: number;
  color?: "brand" | "primary" | "secondary" | "accent" | "muted";
}

export function Loader({ size = 8, color }: LoaderProps) {
  return (
    <Loader2Icon
      className={`h-${size} w-${size} animate-spin ${color ? `text-${color}` : ""}`}
    />
  );
}
