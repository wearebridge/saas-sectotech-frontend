import { UsersTable } from "@/components/root/users/users-table";
import { ClientCredentialsSection } from "@/components/root/users/client-credentials-section";
import { Separator } from "@/components/ui/separator";

function Page() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <ClientCredentialsSection />

      <Separator />
      <div>
        <h2 className="text-lg font-medium mb-4">Usuários da Empresa</h2>
        <UsersTable />
      </div>
    </div>
  );
}

export default Page;
