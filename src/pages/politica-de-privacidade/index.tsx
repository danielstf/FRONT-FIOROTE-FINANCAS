import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../../components/brand-logo";

export function PoliticaPrivacidadePage() {
  const atualizadoEm = "15 de junho de 2025";

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <BrandLogo size="nav" />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Title block */}
        <div className="mb-10 flex flex-col items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Shield className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Política de Privacidade
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Última atualização: {atualizadoEm}
            </p>
          </div>
          <p className="text-base leading-relaxed text-muted-foreground">
            A <strong className="text-foreground">FIOROTE</strong> respeita sua
            privacidade e está comprometida em proteger as informações pessoais
            que você nos fornece. Esta Política de Privacidade descreve quais
            dados coletamos, como os utilizamos e como você pode exercer seus
            direitos.
          </p>
        </div>

        <div className="space-y-10 text-sm leading-relaxed">
          {/* 1 */}
          <Section title="1. Informações que coletamos">
            <p>Ao usar o aplicativo FIOROTE, podemos coletar os seguintes dados:</p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Dados de identificação:</strong>{" "}
                nome, endereço de e-mail e senha (armazenada de forma criptografada).
              </li>
              <li>
                <strong className="text-foreground">Dados financeiros pessoais:</strong>{" "}
                receitas, despesas, categorias, cartões de crédito e perfis
                financeiros inseridos por você manualmente no aplicativo.
              </li>
              <li>
                <strong className="text-foreground">Dados de uso:</strong>{" "}
                informações sobre como você interage com o aplicativo, como
                funcionalidades acessadas e frequência de uso.
              </li>
              <li>
                <strong className="text-foreground">Tokens de notificação:</strong>{" "}
                identificador do dispositivo utilizado para envio de notificações
                push, caso você conceda permissão.
              </li>
              <li>
                <strong className="text-foreground">Dados de autenticação social:</strong>{" "}
                caso você opte por entrar com o Google, recebemos seu nome,
                e-mail e ID público do Google.
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              <strong className="text-foreground">Não coletamos</strong> dados
              bancários, números de cartão de crédito reais, senhas bancárias ou
              qualquer informação de acesso a instituições financeiras.
            </p>
          </Section>

          {/* 2 */}
          <Section title="2. Como utilizamos suas informações">
            <p className="text-muted-foreground">
              Utilizamos os dados coletados exclusivamente para:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Criar e gerenciar sua conta no aplicativo.</li>
              <li>
                Exibir seu painel financeiro, relatórios e histórico de
                lançamentos.
              </li>
              <li>
                Enviar notificações relevantes sobre vencimentos e alertas
                financeiros (somente com sua permissão).
              </li>
              <li>Processar pagamentos da assinatura Premium.</li>
              <li>
                Melhorar continuamente as funcionalidades do aplicativo com base
                em padrões anônimos de uso.
              </li>
              <li>
                Responder a solicitações de suporte e sugestões enviadas por
                você.
              </li>
            </ul>
          </Section>

          {/* 3 */}
          <Section title="3. Compartilhamento de dados">
            <p className="text-muted-foreground">
              Seus dados pessoais{" "}
              <strong className="text-foreground">
                não são vendidos, alugados ou compartilhados
              </strong>{" "}
              com terceiros para fins comerciais. O compartilhamento ocorre
              apenas nas seguintes situações:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>
                <strong className="text-foreground">Provedores de serviço:</strong>{" "}
                parceiros técnicos que nos auxiliam na operação da plataforma
                (hospedagem, banco de dados, autenticação), vinculados
                contratualmente ao sigilo das informações.
              </li>
              <li>
                <strong className="text-foreground">Processamento de pagamentos:</strong>{" "}
                dados necessários para processar sua assinatura Premium são
                compartilhados com o Mercado Pago, de acordo com a política de
                privacidade deles.
              </li>
              <li>
                <strong className="text-foreground">Obrigação legal:</strong>{" "}
                quando exigido por lei, ordem judicial ou autoridade competente.
              </li>
            </ul>
          </Section>

          {/* 4 */}
          <Section title="4. Armazenamento e segurança">
            <p className="text-muted-foreground">
              Seus dados são armazenados em servidores seguros com acesso
              restrito. Adotamos as seguintes medidas de proteção:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Senhas criptografadas com algoritmo bcrypt.</li>
              <li>Comunicação protegida por HTTPS/TLS.</li>
              <li>Autenticação por tokens JWT com prazo de expiração.</li>
              <li>
                Acesso ao banco de dados restrito a sistemas autorizados.
              </li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Embora adotemos medidas técnicas adequadas, nenhum sistema é
              completamente invulnerável. Em caso de incidente de segurança, você
              será notificado conforme exigido pela legislação aplicável.
            </p>
          </Section>

          {/* 5 */}
          <Section title="5. Seus direitos (LGPD)">
            <p className="text-muted-foreground">
              Em conformidade com a Lei Geral de Proteção de Dados (Lei
              13.709/2018), você tem o direito de:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-muted-foreground">
              <li>Confirmar a existência de tratamento de seus dados.</li>
              <li>Acessar os dados que mantemos sobre você.</li>
              <li>Corrigir dados incompletos, inexatos ou desatualizados.</li>
              <li>
                Solicitar a anonimização, bloqueio ou eliminação de dados
                desnecessários.
              </li>
              <li>Solicitar a exclusão completa da sua conta e dados.</li>
              <li>Revogar o consentimento a qualquer momento.</li>
            </ul>
            <p className="mt-3 text-muted-foreground">
              Para exercer qualquer um desses direitos, entre em contato pelo
              e-mail:{" "}
              <a
                href="mailto:fioroteaplicativos@gmail.com"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                fioroteaplicativos@gmail.com
              </a>
            </p>
          </Section>

          {/* 6 */}
          <Section title="6. Retenção de dados">
            <p className="text-muted-foreground">
              Mantemos seus dados enquanto sua conta estiver ativa. Após a
              exclusão da conta, os dados são removidos dos nossos sistemas em
              até <strong className="text-foreground">30 dias</strong>, salvo
              obrigação legal de retenção por período maior.
            </p>
          </Section>

          {/* 7 */}
          <Section title="7. Crianças e adolescentes">
            <p className="text-muted-foreground">
              O FIOROTE não é destinado a menores de 18 anos. Não coletamos
              intencionalmente dados de crianças ou adolescentes. Caso
              identifiquemos que um menor cadastrou uma conta sem consentimento
              dos responsáveis, os dados serão excluídos imediatamente.
            </p>
          </Section>

          {/* 8 */}
          <Section title="8. Alterações nesta política">
            <p className="text-muted-foreground">
              Podemos atualizar esta Política de Privacidade periodicamente.
              Quando isso ocorrer, você será notificado pelo aplicativo e/ou
              e-mail. O uso continuado do aplicativo após as alterações implica
              na aceitação da nova política.
            </p>
          </Section>

          {/* 9 */}
          <Section title="9. Contato">
            <p className="text-muted-foreground">
              Em caso de dúvidas sobre esta Política de Privacidade ou sobre o
              tratamento dos seus dados, entre em contato:
            </p>
            <div className="mt-3 rounded-xl border border-border bg-muted/30 px-5 py-4 text-muted-foreground">
              <p className="font-semibold text-foreground">FIOROTE</p>
              <p className="mt-1">
                E-mail:{" "}
                <a
                  href="mailto:fioroteaplicativos@gmail.com"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  fioroteaplicativos@gmail.com
                </a>
              </p>
            </div>
          </Section>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FIOROTE — Todos os direitos reservados.
      </footer>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h2 className="mb-3 text-base font-bold text-foreground">{title}</h2>
      <div className="text-muted-foreground">{children}</div>
    </section>
  );
}
