"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/lib/keycloak";
import { ScriptsTable } from "@/components/common/scripts/scripts-table";

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

  return <ScriptsTable isPage={true} />;
}

export default Page;
