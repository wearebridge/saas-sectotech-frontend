"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useKeycloak } from "@/lib/keycloak";
import { HomeDashboard } from "@/components/root/dashboard/home-dashboard";

export default function Home() {
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

  return <HomeDashboard />;
}
