import { ChangePasswordSection } from "@/components/root/settings/change-password-section";
import { ThemeSelection } from "@/components/root/settings/theme-selection";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function ConfiguracaoPage() {
  return (
    <Card className="min-h-[98vh]">
      <CardContent className="flex flex-col gap-4">
        <ThemeSelection />
        <Separator />
        <ChangePasswordSection />
      </CardContent>
    </Card>
  );
}
