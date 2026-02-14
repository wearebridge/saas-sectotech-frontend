export interface ClientCredentials {
  clientId: string;
  clientSecret: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  enabled: boolean;
  createdTimestamp: number;
}
