import { LucideIcon } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  StartIcon?: LucideIcon;
  ButtonIcon?: {
    icon: LucideIcon;
    onClick: () => void;
    visible?: boolean;
  };
}

const IconInput = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, StartIcon, ButtonIcon, ...props }, ref) => {
    return (
      <div
        className={cn(
          "flex items-center overflow-hidden dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent text-base shadow-xs transition-[color,box-shadow] md:text-sm",
          "focus-within:border-ring focus-within:ring-ring/50 focus-within:ring-[3px]",
          className,
        )}
      >
        {StartIcon && (
          <div className="flex items-center justify-center p-2 ">
            <StartIcon className="w-4 h-4 text-muted-foreground" />
          </div>
        )}
        <input
          type={type}
          className="flex h-9 w-full bg-transparent px-3 py-1 text-base placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          ref={ref}
          {...props}
        />
        {ButtonIcon && ButtonIcon.visible !== false && (
          <div className="flex items-center justify-center p-2 px-3">
            <ButtonIcon.icon
              className="w-4 h-4 text-muted-foreground cursor-pointer"
              onClick={ButtonIcon.onClick}
              type="button"
            />
          </div>
        )}
      </div>
    );
  },
);

IconInput.displayName = "InputIcon";

export { IconInput };
