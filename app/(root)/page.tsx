import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DashboardTable } from "@/components/root/dashboard/dashboard-table";
import { Label } from "@/components/ui/label";

export default function Home() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <Label className="text-lg font-semibold">Últimas 5 análises</Label>
        <Link href="/historico">
          <Button variant="outline">Ver histórico completo</Button>
        </Link>
      </div>
      <DashboardTable isHomeView={true} />
    </div>
  );
}
