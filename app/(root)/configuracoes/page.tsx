import { ThemeSelection } from "@/components/root/settings/theme-selection";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function ConfiguracaoPage() {
  return (
    <Card className="min-h-[98vh]">
      <CardHeader className="flex flex-row justify-between items-center py-4">
        <CardTitle>Configurações</CardTitle>
        <SidebarTrigger />
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <Separator />
        <ThemeSelection />
      </CardContent>
    </Card>
  );
}
