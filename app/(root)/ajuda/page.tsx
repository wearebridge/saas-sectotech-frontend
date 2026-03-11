import { Mail, MessageCircleQuestion } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const faqItems = [
  {
    question: "Como inicio uma nova análise de áudio?",
    answer:
      "No menu lateral, clique em Nova análise. Em seguida, selecione o subtipo de serviço, envie o arquivo de áudio e inicie o processamento.",
  },
  {
    question: "Quais formatos de áudio são aceitos?",
    answer:
      "Os formatos disponíveis dependem da configuração do serviço. Se um arquivo não for aceito, tente converter para um formato mais comum (como MP3 ou WAV) e reenviar.",
  },
  {
    question: "Onde acompanho o resultado das minhas análises?",
    answer:
      "Use a página Histórico de Análises para visualizar resultados já processados. Você também pode abrir os detalhes de cada análise para revisar informações específicas.",
  },
  {
    question: "Posso reutilizar scripts nas análises?",
    answer:
      "Sim. Na área Scripts você cadastra e mantém scripts para reutilizar nos fluxos de análise, garantindo mais velocidade e padronização.",
  },
  {
    question: "Como funciona o consumo de créditos?",
    answer:
      "Cada análise consome créditos conforme as regras do serviço contratado. O saldo atual pode ser consultado na página Créditos.",
  },
  {
    question: "Como compro mais créditos?",
    answer:
      "Na página Créditos você encontra pacotes avulsos e planos recorrentes. Após o pagamento confirmado, os créditos ficam disponíveis na conta.",
  },
  {
    question: "Os créditos expiram?",
    answer:
      "Sim, os créditos podem ter validade. Consulte a aba Validade dos Créditos na página de créditos para acompanhar os prazos dos lotes.",
  },
  {
    question: "Como gerencio usuários da empresa?",
    answer:
      "Administradores podem acessar a página Usuários para convidar, visualizar e gerenciar pessoas da equipe e permissões de acesso.",
  },
  {
    question: "Para que serve a área de Clientes?",
    answer:
      "A área Clientes organiza análises por cliente, facilitando o acompanhamento do histórico e o atendimento de demandas específicas.",
  },
  {
    question: "O que fazer quando uma análise falha ou demora?",
    answer:
      "Verifique se o arquivo está íntegro e dentro dos parâmetros esperados. Se o problema persistir, registre o horário da tentativa e entre em contato com o suporte.",
  },
  {
    question: "Esqueci minha senha. Como recuperar acesso?",
    answer:
      "Use o fluxo de recuperação de senha na tela de login. Se necessário, um administrador da sua empresa também pode orientar o processo de acesso.",
  },
  {
    question: "Como altero preferências da conta?",
    answer:
      "Acesse Configurações para alterar itens como senha e preferências disponíveis no seu perfil.",
  },
  {
    question: "A plataforma possui API para integração?",
    answer:
      "Sim. A SectoTech disponibiliza API para integrações e automações. Para autenticação, utilize token Bearer (Keycloak) e consulte a documentação em Usuários > Documentação.",
  },
  {
    question: "Meus dados e áudios ficam protegidos?",
    answer:
      "A plataforma aplica controles de autenticação e acesso por usuário/empresa. Recomendamos que cada pessoa utilize sua própria conta e mantenha a senha segura.",
  },
  {
    question:
      "Por que alguns downloads de áudio ficam mais lentos após um tempo?",
    answer:
      "Após 60 dias, o áudio pode ser resfriado no bucket de armazenamento. Quando isso acontece, o arquivo pode levar mais tempo para ficar disponível no download.",
  },
  {
    question: "Como falar com o suporte técnico?",
    answer:
      "Se tiver dúvidas operacionais, erros recorrentes ou necessidade de orientação, envie um e-mail para nossa equipe de suporte.",
  },
];

export default function AjudaPage() {
  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircleQuestion className="h-5 w-5" />
            Central de Ajuda
          </CardTitle>
          <CardDescription>
            Tire dúvidas frequentes sobre análises, créditos, usuários e
            configurações da plataforma.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full -mx-6">
            {faqItems.map((item) => (
              <AccordionItem
                key={item.question}
                value={item.question}
                className="border-b px-6"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed pb-4">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Precisa de ajuda adicional?</CardTitle>
          <CardDescription>
            Se não encontrou sua resposta na FAQ, fale com nosso suporte.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild variant="sectotech" className="w-full sm:w-fit">
            <a href="mailto:suporte@sectotech.com?subject=Suporte%20SectoTech">
              <Mail className="h-4 w-4" />
              Enviar e-mail para suporte@sectotech.com
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
