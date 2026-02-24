import { ChangePasswordSection } from "@/components/root/settings/change-password-section";
import { ThemeSelection } from "@/components/root/settings/theme-selection";
import { Separator } from "@/components/ui/separator";

export default function ConfiguracaoPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <ChangePasswordSection />
      <Separator />
      <ThemeSelection />
    </div>
  );
}
