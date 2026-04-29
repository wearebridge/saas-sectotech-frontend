"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { UsersTable } from "@/components/root/users/users-table";
import { ClientCredentialsSection } from "@/components/root/users/client-credentials-section";
import { Separator } from "@/components/ui/separator";
import { useKeycloak } from "@/lib/keycloak";

function Page() {
  const { isCompanyAdmin } = useKeycloak();
  const router = useRouter();

  useEffect(() => {
    if (!isCompanyAdmin) {
      router.replace("/historico");
    }
  }, [isCompanyAdmin, router]);

  if (!isCompanyAdmin) {
    return null;
  }

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
