export interface Client {
  id: string;
  name: string;
  surname: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  name: string;
  surname: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  status: 'active' | 'inactive';
}

export interface ClientResponse extends Client {}