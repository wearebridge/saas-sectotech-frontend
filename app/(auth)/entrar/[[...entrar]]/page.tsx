"use client";

import { useEffect } from "react";

function SignInPage() {
  useEffect(() => {
    const redirectUri = encodeURIComponent(window.location.origin + "/");
    const loginUrl = `${process.env.NEXT_PUBLIC_KEYCLOAK_URL}/realms/${process.env.NEXT_PUBLIC_KEYCLOAK_REALM}/protocol/openid-connect/auth?client_id=${process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID}&redirect_uri=${redirectUri}&response_type=code&scope=openid`;
    window.location.href = loginUrl;
  }, []);

  return null;
}

export default SignInPage;
