import { Check, X } from "lucide-react";
import { Label } from "../ui/label";

type Props = {
  isValid: boolean;
  text: string;
};

const PasswordRequirement = ({ isValid, text }: Props) => {
  return (
    <div className="flex gap-1 flex-row items-center justify-center">
      {isValid ? (
        <Check className=" w-5 h-5" />
      ) : (
        <X className="text-destructive w-5 h-5" />
      )}

      <Label className={isValid ? "" : "text-destructive"}>{text}</Label>
    </div>
  );
};

export { PasswordRequirement };
