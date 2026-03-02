import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type EndpointMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type EndpointDoc = {
  method: EndpointMethod;
  path: string;
  description: string;
};

type SectionDoc = {
  title: string;
  basePath: string;
  auth: "Pública" | "Bearer Token (Keycloak)";
  endpoints: EndpointDoc[];
};

type DetailedEndpoint = EndpointDoc & {
  payload?: {
    type: string;
    example: object | string;
    fields?: {
      name: string;
      type: string;
      required: boolean;
      description: string;
    }[];
  };
  response?: {
    type: string;
    example: object | string;
  };
  errors?: { code: number; description: string; examples: string[] }[];
};

type DetailedSection = Omit<SectionDoc, "endpoints"> & {
  endpoints: DetailedEndpoint[];
};

const sections: DetailedSection[] = [
  {
    title: "Análises de IA",
    basePath: "/analyze",
    auth: "Bearer Token (Keycloak)",
    endpoints: [
      {
        method: "POST",
        path: "/analyze/generate",
        description:
          "Envia script + transcrição (ou áudio) para gerar a análise comparativa.",
        payload: {
          type: "Form Data (multipart/form-data)",
          example: {
            data: {
              clientId: "550e8400-e29b-41d4-a716-446655440000",
              scriptId: "550e8400-e29b-41d4-a716-446655440001",
              transcription: "Meu nome é João da Silva",
              scriptItems: [
                {
                  question: "Qual é o seu nome?",
                  answer: "João da Silva",
                  linkedClientField: "fullName",
                },
              ],
            },
            file: "audio.mp3 (optional)",
          },
          fields: [
            {
              name: "data",
              type: "JSON (AnalysisRequestDto)",
              required: true,
              description: "Objeto contendo scriptItems e metadados",
            },
            {
              name: "file",
              type: "MultipartFile",
              required: false,
              description:
                "Arquivo de áudio (MP3, WAV, etc). Opcional se transcription preenchida",
            },
          ],
        },
        response: {
          type: "OpenAiAnalysisResponseDTO",
          example: {
            approved: true,
            transcription: "Meu nome é João da Silva",
            output: [
              {
                question: "Qual é o seu nome?",
                answer: "João da Silva",
                correct: true,
                questionAsked: true,
                analysis: "A resposta está correta",
              },
            ],
          },
        },
        errors: [
          {
            code: 400,
            description: "Requisição inválida ou violação de regra de negócio",
            examples: [
              "Transcription or audio file is required",
              "Créditos insuficientes para realizar esta análise. Necessário: X créditos",
              "Não foi possível recuperar os dados do script da análise",
            ],
          },
          {
            code: 401,
            description: "Usuário não autenticado",
            examples: ["Unauthorized"],
          },
        ],
      },
      {
        method: "POST",
        path: "/analyze/calculate-credits",
        description:
          "Calcula créditos necessários com base na duração exata do áudio (1 crédito por 60 segundos, mínimo 1).",
        payload: {
          type: "Form Data (multipart/form-data)",
          example: {
            file: "audio.mp3",
          },
          fields: [
            {
              name: "file",
              type: "MultipartFile",
              required: true,
              description: "Arquivo de áudio para cálculo",
            },
          ],
        },
        response: {
          type: "CreditEstimationResponseDto",
          example: {
            durationInSeconds: 125.5,
            estimatedCredits: 3.0,
          },
        },
        errors: [
          {
            code: 400,
            description: "Arquivo inválido ou erro ao processar",
            examples: [
              "Arquivo de áudio é obrigatório",
              "Não foi possível determinar a duração do áudio",
            ],
          },
        ],
      },
    ],
  },
  {
    title: "Histórico de Resultados",
    basePath: "/analysis-results",
    auth: "Bearer Token (Keycloak)",
    endpoints: [
      {
        method: "GET",
        path: "/analysis-results?clientId={clientId}",
        description:
          "Lista análises da empresa autenticada (opcionalmente filtrando por clientId).",
        response: {
          type: "AnalysisResultResponseDto[]",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            clientId: "550e8400-e29b-41d4-a716-446655440001",
            clientName: "João da Silva",
            clientCpf: "12345678901",
            audioFilename: "audio_123.mp3",
            audioUrl: "https://s3.url/audio_123.mp3",
            transcription: "Meu nome é João",
            approved: true,
            creditsUsed: 3.0,
            executedBy: "usuario@empresa.com",
            createdAt: "2024-03-01T10:30:00Z",
            serviceTypeName: "Análise de Voz",
            serviceSubTypeName: "Verificação de Identidade",
          },
        },
        errors: [
          {
            code: 401,
            description: "Usuário não autenticado",
            examples: ["User not associated with any company"],
          },
        ],
      },
      {
        method: "GET",
        path: "/analysis-results/{id}",
        description: "Busca uma análise específica por ID.",
        response: {
          type: "AnalysisResultResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            clientId: "550e8400-e29b-41d4-a716-446655440001",
            clientName: "João da Silva",
            approved: true,
            creditsUsed: 3.0,
          },
        },
        errors: [
          {
            code: 404,
            description: "Análise não encontrada",
            examples: ["Analysis result not found"],
          },
          {
            code: 403,
            description: "Sem permissão para acessar",
            examples: ["Analysis result not found"],
          },
        ],
      },
      {
        method: "POST",
        path: "/analysis-results/{id}/regenerate",
        description:
          "Reexecuta uma análise existente com os mesmos dados e débito de créditos.",
        response: {
          type: "AnalysisResultResponseDto",
          example: {
            id: "nova-id-gerada",
            approved: true,
          },
        },
        errors: [
          {
            code: 400,
            description: "Violação de regra de negócio",
            examples: [
              "Créditos insuficientes para re-gerar esta análise",
              "A análise original não possui transcrição para re-gerar",
            ],
          },
          {
            code: 404,
            description: "Análise original não encontrada",
            examples: ["Analysis result not found"],
          },
        ],
      },
      {
        method: "GET",
        path: "/analysis-results/{id}/download-url",
        description: "Gera URL temporária para download do áudio da análise.",
        response: {
          type: "String (URL)",
          example: "https://s3.url/audio_temp?token=xyz&expires=3600",
        },
        errors: [
          {
            code: 404,
            description: "Análise ou áudio não encontrado",
            examples: ["Analysis result not found"],
          },
        ],
      },
    ],
  },
  {
    title: "Clientes",
    basePath: "/clients",
    auth: "Bearer Token (Keycloak)",
    endpoints: [
      {
        method: "GET",
        path: "/clients",
        description: "Lista clientes ativos da empresa autenticada.",
        response: {
          type: "ClientResponseDto[]",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            fullName: "João da Silva",
            cpf: "12345678901",
            email: "joao@example.com",
            phone: "11999998888",
            status: true,
          },
        },
      },
      {
        method: "GET",
        path: "/clients/search?q={termo}",
        description:
          "Busca clientes por CPF (com ou sem formatação) ou nome. Busca case-insensitive.",
        response: {
          type: "ClientResponseDto[]",
          example: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              fullName: "João da Silva",
              cpf: "12345678901",
            },
          ],
        },
      },
      {
        method: "GET",
        path: "/clients/{id}",
        description: "Busca cliente por ID.",
        response: {
          type: "ClientResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            fullName: "João da Silva",
            birthDate: "1990-01-15",
            cpf: "12345678901",
            rg: "123456789",
            address: "Rua Principal, 123",
            phone: "11999998888",
            email: "joao@example.com",
            status: true,
            gender: "MALE",
          },
        },
        errors: [
          {
            code: 404,
            description: "Cliente não encontrado",
            examples: ["Client not found"],
          },
          {
            code: 403,
            description: "Sem permissão para acessar este cliente",
            examples: ["Unauthorized to access this client"],
          },
        ],
      },
      {
        method: "POST",
        path: "/clients",
        description: "Cria cliente na empresa autenticada. CPF deve ser único.",
        payload: {
          type: "JSON (ClientRequestDto)",
          example: {
            fullName: "João da Silva",
            birthDate: "1990-01-15",
            cpf: "12345678901",
            rg: "123456789",
            address: "Rua Principal, 123",
            phone: "11999998888",
            email: "joao@example.com",
            status: true,
            gender: "MALE",
          },
          fields: [
            {
              name: "fullName",
              type: "string",
              required: true,
              description: "Nome completo (máx 200 caracteres)",
            },
            {
              name: "cpf",
              type: "string",
              required: false,
              description:
                "CPF (apenas números, máx 11 caracteres). Deve ser único",
            },
            {
              name: "email",
              type: "string",
              required: false,
              description: "Email válido",
            },
            {
              name: "phone",
              type: "string",
              required: false,
              description: "Telefone (máx 20 caracteres)",
            },
            {
              name: "status",
              type: "boolean",
              required: false,
              description: "Status ativo (padrão: true)",
            },
            {
              name: "gender",
              type: "enum",
              required: false,
              description: "Gênero: MALE, FEMALE, OTHER",
            },
          ],
        },
        response: {
          type: "ClientResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            fullName: "João da Silva",
            cpf: "12345678901",
          },
        },
        errors: [
          {
            code: 400,
            description: "Dados inválidos ou violação de regra",
            examples: [
              "Full name is required",
              "CPF already exists",
              "Invalid email format",
            ],
          },
        ],
      },
      {
        method: "PUT",
        path: "/clients/{id}",
        description: "Atualiza dados de cliente.",
        payload: {
          type: "JSON (ClientRequestDto)",
          example: {
            fullName: "João da Silva Atualizado",
            email: "novo-email@example.com",
          },
        },
        response: {
          type: "ClientResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            fullName: "João da Silva Atualizado",
          },
        },
        errors: [
          {
            code: 404,
            description: "Cliente não encontrado",
            examples: ["Client not found"],
          },
          {
            code: 400,
            description: "CPF já existe para outro cliente",
            examples: ["CPF already exists"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized to access this client"],
          },
        ],
      },
      {
        method: "DELETE",
        path: "/clients/{id}",
        description: "Desativa cliente (soft delete).",
        response: {
          type: "void",
          example: {} as never,
        },
        errors: [
          {
            code: 404,
            description: "Cliente não encontrado",
            examples: ["Client not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
    ],
  },
  {
    title: "Subtipos de Serviço",
    basePath: "/service-sub-types",
    auth: "Bearer Token (Keycloak)",
    endpoints: [
      {
        method: "GET",
        path: "/service-sub-types",
        description: "Lista subtipos de serviço da empresa.",
        response: {
          type: "ServiceSubTypeResponseDto[]",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Verificação de Identidade",
            description: "Verificação de identidade via análise de voz",
            status: true,
          },
        },
      },
      {
        method: "POST",
        path: "/service-sub-types",
        description: "Cria um novo subtipo de serviço.",
        payload: {
          type: "JSON (ServiceSubType)",
          example: {
            name: "Verificação de Identidade",
            description: "Verificação de identidade via análise de voz",
            status: true,
          },
          fields: [
            {
              name: "name",
              type: "string",
              required: true,
              description: "Nome do subtipo",
            },
            {
              name: "description",
              type: "string",
              required: false,
              description: "Descrição do subtipo",
            },
            {
              name: "status",
              type: "boolean",
              required: false,
              description: "Status ativo (padrão: true)",
            },
          ],
        },
        response: {
          type: "ServiceSubTypeResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Verificação de Identidade",
            status: true,
          },
        },
      },
      {
        method: "PUT",
        path: "/service-sub-types/{id}",
        description: "Atualiza um subtipo de serviço.",
        payload: {
          type: "JSON (ServiceSubType)",
          example: {
            name: "Verificação de Identidade v2",
            description: "Descrição atualizada",
          },
        },
        response: {
          type: "ServiceSubTypeResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Verificação de Identidade v2",
          },
        },
        errors: [
          {
            code: 404,
            description: "Subtipo não encontrado",
            examples: ["ServiceSubType not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
    ],
  },
  {
    title: "Tipos de Serviço",
    basePath: "/service-types",
    auth: "Bearer Token (Keycloak)",
    endpoints: [
      {
        method: "GET",
        path: "/service-types",
        description: "Lista tipos de serviço da empresa.",
        response: {
          type: "ServiceTypeResponseDto[]",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Análise de Voz Completa",
            description: "Análise completa incluindo identificação",
            status: true,
            serviceSubTypeId: "550e8400-e29b-41d4-a716-446655440001",
            serviceSubTypeName: "Verificação de Identidade",
          },
        },
      },
      {
        method: "GET",
        path: "/service-types/byServiceSubType/{serviceSubTypeId}",
        description: "Lista tipos de serviço por subtipo.",
        response: {
          type: "ServiceTypeResponseDto[]",
          example: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              name: "Análise Rápida",
              serviceSubTypeId: "550e8400-e29b-41d4-a716-446655440001",
            },
          ],
        },
        errors: [
          {
            code: 404,
            description: "Subtipo não encontrado",
            examples: ["ServiceSubType not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
      {
        method: "POST",
        path: "/service-types/byServiceSubType/{serviceSubTypeId}",
        description: "Cria tipo de serviço vinculado a um subtipo.",
        payload: {
          type: "JSON (ServiceType)",
          example: {
            name: "Análise Rápida",
            description: "Análise rápida de identidade",
            status: true,
          },
          fields: [
            {
              name: "name",
              type: "string",
              required: true,
              description: "Nome do tipo de serviço",
            },
            {
              name: "description",
              type: "string",
              required: false,
              description: "Descrição",
            },
            {
              name: "status",
              type: "boolean",
              required: false,
              description: "Status (padrão: true)",
            },
          ],
        },
        response: {
          type: "ServiceTypeResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Análise Rápida",
            serviceSubTypeId: "550e8400-e29b-41d4-a716-446655440001",
          },
        },
        errors: [
          {
            code: 404,
            description: "Subtipo não encontrado",
            examples: ["ServiceSubType not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
      {
        method: "PUT",
        path: "/service-types/{id}",
        description: "Atualiza tipo de serviço.",
        payload: {
          type: "JSON (ServiceType)",
          example: {
            name: "Análise Rápida v2",
            description: "Descrição atualizada",
            status: true,
          },
        },
        response: {
          type: "ServiceTypeResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Análise Rápida v2",
          },
        },
        errors: [
          {
            code: 404,
            description: "Tipo não encontrado",
            examples: ["ServiceType not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
    ],
  },
  {
    title: "Scripts",
    basePath: "/scripts",
    auth: "Bearer Token (Keycloak)",
    endpoints: [
      {
        method: "GET",
        path: "/scripts",
        description: "Lista scripts da empresa.",
        response: {
          type: "ScriptResponseDto[]",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Script de Verificação",
            status: true,
            scriptItems: [
              {
                id: "550e8400-e29b-41d4-a716-446655440001",
                question: "Qual é o seu nome?",
                answer: "João Silva",
                linkedClientField: "fullName",
              },
            ],
            serviceTypeId: "550e8400-e29b-41d4-a716-446655440002",
            serviceTypeName: "Verificação de Voz",
          },
        },
      },
      {
        method: "GET",
        path: "/scripts/byServiceType/{serviceTypeId}",
        description: "Lista scripts por tipo de serviço.",
        response: {
          type: "ScriptResponseDto[]",
          example: [
            {
              id: "550e8400-e29b-41d4-a716-446655440000",
              name: "Script 1",
            },
          ],
        },
        errors: [
          {
            code: 404,
            description: "Tipo de serviço não encontrado",
            examples: ["ServiceType not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
      {
        method: "GET",
        path: "/scripts/{id}",
        description: "Busca script por ID.",
        response: {
          type: "ScriptResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Script de Verificação",
            status: true,
          },
        },
        errors: [
          {
            code: 404,
            description: "Script não encontrado",
            examples: ["Script not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
      {
        method: "POST",
        path: "/scripts/byServiceType/{serviceTypeId}",
        description: "Cria script para um tipo de serviço.",
        payload: {
          type: "JSON (Script)",
          example: {
            name: "Script de Verificação",
            status: true,
            scriptItems: [
              {
                question: "Qual é o seu nome?",
                answer: "João Silva",
                linkedClientField: "fullName",
              },
            ],
          },
        },
        response: {
          type: "ScriptResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Script de Verificação",
          },
        },
      },
      {
        method: "PUT",
        path: "/scripts/{id}",
        description: "Atualiza script e itens do script.",
        payload: {
          type: "JSON (Script)",
          example: {
            name: "Script de Verificação v2",
            status: true,
            scriptItems: [
              {
                question: "Qual é o seu nome completo?",
                answer: "João da Silva",
                linkedClientField: "fullName",
              },
            ],
          },
        },
        response: {
          type: "ScriptResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            name: "Script de Verificação v2",
          },
        },
        errors: [
          {
            code: 404,
            description: "Script não encontrado",
            examples: ["Script not found"],
          },
          {
            code: 403,
            description: "Sem permissão",
            examples: ["Unauthorized"],
          },
        ],
      },
    ],
  },
  {
    title: "Créditos da Empresa",
    basePath: "/companyCredits",
    auth: "Bearer Token (Keycloak)",
    endpoints: [
      {
        method: "GET",
        path: "/companyCredits/byCompanyId/{id}",
        description:
          "Consulta saldo de créditos por empresa. Cria automaticamente uma conta com saldo zero se não existir. Regra: 1 crédito por 60 segundos de áudio.",
        response: {
          type: "CompanyCreditResponseDto",
          example: {
            id: "550e8400-e29b-41d4-a716-446655440000",
            creditAmount: 150.5,
          },
        },
        errors: [
          {
            code: 404,
            description: "Empresa não encontrada",
            examples: ["Company not found"],
          },
        ],
      },
    ],
  },
];

function methodVariant(
  method: EndpointMethod,
): "default" | "secondary" | "outline" {
  if (method === "GET") {
    return "secondary";
  }

  if (method === "POST") {
    return "default";
  }

  return "outline";
}

const KEYCLOAK_BASE_URL =
  process.env.NEXT_PUBLIC_KEYCLOAK_BASE_URL || "https://keycloak.example.com";
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://api.example.com";

export default function DocumentacaoPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Autenticação - Client Credentials Flow</CardTitle>
          <CardDescription>
            Exemplo de como obter e usar um token para integrações
            servidor-servidor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium mb-2">
              1. Obter token via Keycloak
            </p>
            <code className="block bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
              {`POST ${KEYCLOAK_BASE_URL}/realms/secto/protocol/openid-connect/token`}
              <br />
              {`grant_type=client_credentials&client_id=<CLIENT_ID>&client_secret=<CLIENT_SECRET>`}
            </code>
          </div>

          <div>
            <p className="text-sm font-medium mb-2">
              2. Usar o token nas requisições
            </p>
            <code className="block bg-muted p-3 rounded text-xs font-mono">
              Authorization: Bearer &lt;access_token&gt;
            </code>
          </div>

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-2">Exemplo (JavaScript):</p>
            <code className="block bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
              {`const res = await fetch('${API_BASE_URL}/endpoint', {
  headers: { 'Authorization': 'Bearer ' + accessToken }
});`}
            </code>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Endpoints por Domínio</CardTitle>
          <CardDescription>
            Expanda cada seção para ver detalhes do method, rota, payload e
            respostas.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full -mx-6">
            {sections.map((section) => (
              <AccordionItem
                key={section.title}
                value={section.title}
                className="border-b px-6"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-wrap items-center gap-2 text-left">
                    <span className="font-semibold">{section.title}</span>
                    <Badge variant="outline" className="text-xs">
                      {section.basePath}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-0 pt-4 pb-4">
                  <div className="flex flex-col gap-6">
                    {section.endpoints.map((endpoint) => (
                      <div
                        key={`${endpoint.method}-${endpoint.path}`}
                        className="space-y-3 pb-2 border-b last:border-b-0"
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={methodVariant(endpoint.method)}>
                              {endpoint.method}
                            </Badge>
                            <code className="text-sm font-mono font-medium text-foreground break-all">
                              {endpoint.path}
                            </code>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {endpoint.description}
                          </p>
                        </div>

                        {/* Payload Section */}
                        {endpoint.payload && (
                          <div className="space-y-2 pt-2">
                            <div>
                              <p className="text-xs font-semibold mb-2">
                                📥 Payload ({endpoint.payload.type})
                              </p>
                              {endpoint.payload.fields && (
                                <div className="mb-3 text-xs border rounded-md overflow-hidden">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="bg-muted border-b">
                                        <th className="text-left py-2 px-3 font-semibold">
                                          Campo
                                        </th>
                                        <th className="text-left py-2 px-3 font-semibold">
                                          Tipo
                                        </th>
                                        <th className="text-left py-2 px-3 font-semibold">
                                          Obr.
                                        </th>
                                        <th className="text-left py-2 px-3 font-semibold">
                                          Descrição
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {endpoint.payload.fields.map((field) => (
                                        <tr
                                          key={field.name}
                                          className="border-b hover:bg-muted/50"
                                        >
                                          <td className="py-2 px-3 font-mono text-xs">
                                            {field.name}
                                          </td>
                                          <td className="py-2 px-3 text-xs">
                                            <Badge
                                              variant="outline"
                                              className="text-xs"
                                            >
                                              {field.type}
                                            </Badge>
                                          </td>
                                          <td className="py-2 px-3 text-xs">
                                            {field.required ? (
                                              <span className="font-bold text-red-600">
                                                *
                                              </span>
                                            ) : (
                                              <span className="text-muted-foreground">
                                                -
                                              </span>
                                            )}
                                          </td>
                                          <td className="py-2 px-3 text-xs text-muted-foreground">
                                            {field.description}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                              <div className="text-xs space-y-1">
                                <p className="font-medium">Exemplo:</p>
                                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto font-mono leading-relaxed">
                                  {JSON.stringify(
                                    endpoint.payload.example,
                                    null,
                                    2,
                                  )}
                                </pre>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Response Section */}
                        {endpoint.response && (
                          <div className="space-y-2 pt-2 border rounded-md border-green-200 dark:border-green-900 bg-green-50 dark:bg-green-950/20 p-3">
                            <div>
                              <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-2">
                                ✅ Resposta Sucesso (200) -{" "}
                                {endpoint.response.type}
                              </p>
                              <pre className="bg-muted p-3 rounded text-xs overflow-x-auto font-mono leading-relaxed">
                                {JSON.stringify(
                                  endpoint.response.example,
                                  null,
                                  2,
                                )}
                              </pre>
                            </div>
                          </div>
                        )}

                        {/* Errors Section */}
                        {endpoint.errors && endpoint.errors.length > 0 && (
                          <div className="space-y-2 pt-2 border rounded-md border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20 p-3">
                            <p className="text-xs font-semibold text-red-900 dark:text-red-100">
                              ❌ Possíveis Erros
                            </p>
                            <div className="space-y-1">
                              {endpoint.errors.map((error, idx) => (
                                <div
                                  key={idx}
                                  className="border-l-4 border-red-300 dark:border-red-700 pl-3 py-2"
                                >
                                  <div className="flex items-center gap-2 mb-1">
                                    <Badge
                                      variant="destructive"
                                      className="text-xs"
                                    >
                                      {error.code}
                                    </Badge>
                                    <span className="text-xs font-medium text-red-900 dark:text-red-100">
                                      {error.description}
                                    </span>
                                  </div>
                                  <ul className="text-xs text-red-800 dark:text-red-200 list-disc list-inside space-y-0.5">
                                    {error.examples.map((example, eidx) => (
                                      <li key={eidx}>{example}</li>
                                    ))}
                                  </ul>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
