"use client";

import Keycloak from "keycloak-js";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import { Loader2Icon } from "lucide-react";

interface KeycloakContextType {
  keycloak: Keycloak | null;
  authenticated: boolean;
  loading: boolean;
  token: string | undefined;
  currentUserId: string | undefined;
  roles: string[];
  isCompanyAdmin: boolean;
  login: () => void;
  logout: () => void;
}

const KeycloakContext = createContext<KeycloakContextType | undefined>(
  undefined,
);

interface KeycloakProviderProps {
  children: ReactNode;
}

export function KeycloakProvider({ children }: KeycloakProviderProps) {
  const pathname = usePathname();
  const [keycloak, setKeycloak] = useState<Keycloak | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | undefined>();
  const [currentUserId, setCurrentUserId] = useState<string | undefined>();
  const [roles, setRoles] = useState<string[]>([]);

  useEffect(() => {
    const kc = new Keycloak({
      url: process.env.NEXT_PUBLIC_KEYCLOAK_URL || "",
      realm: process.env.NEXT_PUBLIC_KEYCLOAK_REALM || "",
      clientId: process.env.NEXT_PUBLIC_KEYCLOAK_CLIENT_ID || "",
    });

    kc.init({
      onLoad: "check-sso",
      silentCheckSsoRedirectUri:
        window.location.origin + "/silent-check-sso.html",
    })
      .then((auth) => {
        setKeycloak(kc);
        setAuthenticated(auth);
        setToken(kc.token);
        if (auth && kc.tokenParsed) {
          setCurrentUserId(kc.tokenParsed.sub);
          const realmAccess = (kc.tokenParsed as Record<string, unknown>).realm_access as { roles?: string[] } | undefined;
          setRoles(realmAccess?.roles ?? []);
        }
        setLoading(false);

        if (auth) {
          // Auto refresh token
          setInterval(() => {
            kc.updateToken(30)
              .then((refreshed) => {
                if (refreshed) {
                  setToken(kc.token);
                }
              })
              .catch(() => {
                console.log("Failed to refresh token");
              });
          }, 30000);
        }
      })
      .catch(() => {
        setLoading(false);
        console.log("Authenticated: false");
      });
  }, []);
  useEffect(() => {
    if (!loading && !authenticated && pathname !== "/") {
      keycloak?.login();
    }
  }, [loading, authenticated, pathname, keycloak]);

  const login = () => {
    keycloak?.login();
  };

  const logout = () => {
    keycloak?.logout();
  };

  if (loading || (!authenticated && pathname !== "/")) {
    return (
      <div className="h-screen flex flex-row gap-1 w-full items-center justify-center">
        <Loader2Icon className={"animate-spin w-10 h-10"} />
      </div>
    );
  }

  return (
    <KeycloakContext.Provider
      value={{
        keycloak,
        authenticated,
        loading,
        token,
        currentUserId,
        roles,
        isCompanyAdmin: roles.includes("company-admin"),
        login,
        logout,
      }}
    >
      {children}
    </KeycloakContext.Provider>
  );
}

export const useKeycloak = () => {
  const context = useContext(KeycloakContext);
  if (context === undefined) {
    throw new Error("useKeycloak must be used within a KeycloakProvider");
  }
  return context;
};
