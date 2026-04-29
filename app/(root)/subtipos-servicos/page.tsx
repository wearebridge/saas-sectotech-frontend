"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/lib/keycloak";
import { ServiceSubTypeTable } from "@/components/root/services/service-sub-type-table";

export default function ServicesPage() {
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

  return <ServiceSubTypeTable />;
}
