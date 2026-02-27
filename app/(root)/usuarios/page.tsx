"use client";

import { UsersTable } from "@/components/root/users/users-table";
import { ClientCredentialsSection } from "@/components/root/users/client-credentials-section";
import { Separator } from "@/components/ui/separator";
import { useKeycloak } from "@/lib/keycloak";

function Page() {
  const { isCompanyAdmin } = useKeycloak();

  return (
    <div className="flex flex-col gap-6 p-6">
      {isCompanyAdmin && (
        <>
          <ClientCredentialsSection />
          <Separator />
        </>
      )}
      <div>
        <h2 className="text-lg font-medium mb-4">Usuários da Empresa</h2>
        <UsersTable />
      </div>
    </div>
  );
}

export default Page;
