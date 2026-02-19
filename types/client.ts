export interface Client {
  id: string;
  fullName: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  phone?: string;
  email?: string;
  sexo?: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientRequest {
  fullName: string;
  birthDate?: string;
  cpf?: string;
  rg?: string;
  address?: string;
  phone?: string;
  email?: string;
  sexo?: 'MASCULINO' | 'FEMININO' | 'OUTRO';
  status: 'active' | 'inactive';
}

export interface ClientResponse extends Client {}

// Campos do cliente que podem ser vinculados a perguntas de script
export type ClientFieldKey = 'fullName' | 'cpf' | 'rg' | 'birthDate' | 'address' | 'phone' | 'email' | 'sexo';

export const CLIENT_FIELD_LABELS: Record<ClientFieldKey, string> = {
  fullName: 'Nome Completo',
  cpf: 'CPF',
  rg: 'RG',
  birthDate: 'Data de Nascimento',
  address: 'Endereço',
  phone: 'Telefone',
  email: 'E-mail',
  sexo: 'Sexo',
};