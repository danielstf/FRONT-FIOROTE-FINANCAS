import {
  ArrowLeft,
  HelpCircle,
  Mail,
  MessageSquare,
  Trash2,
  UserX,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../../components/brand-logo";

export function SuportePage() {
  const email = "fioroteaplicativos@gmail.com";

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

      <main className="mx-auto max-w-3xl px-4 py-12">
        {/* Title block */}
        <div className="mb-12 flex flex-col items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Central de Suporte
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Estamos aqui para ajudar. Escolha o assunto abaixo.
            </p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {/* Dúvidas gerais */}
          <ContactCard
            icon={<MessageSquare className="h-5 w-5" />}
            color="primary"
            title="Dúvidas e sugestões"
            description="Tem alguma dúvida sobre o app ou quer sugerir uma melhoria? Entre em contato e responderemos o mais breve possível."
            email={email}
            subject="Dúvida / Sugestão — FIOROTE"
            label="Enviar mensagem"
          />

          {/* Problemas técnicos */}
          <ContactCard
            icon={<HelpCircle className="h-5 w-5" />}
            color="amber"
            title="Problemas técnicos"
            description="Encontrou algum erro ou bug no aplicativo? Descreva o problema com detalhes e iremos investigar."
            email={email}
            subject="Problema técnico — FIOROTE"
            label="Reportar problema"
          />

          {/* Cancelar assinatura */}
          <ContactCard
            icon={<UserX className="h-5 w-5" />}
            color="orange"
            title="Cancelar assinatura Premium"
            description="Para cancelar sua assinatura Premium, envie um e-mail com o assunto indicado. O cancelamento será processado em até 2 dias úteis."
            email={email}
            subject="Cancelar assinatura Premium — FIOROTE"
            label="Solicitar cancelamento"
            tip="Após o cancelamento, você mantém acesso Premium até o fim do período já pago."
          />

          {/* Excluir conta */}
          <ContactCard
            icon={<Trash2 className="h-5 w-5" />}
            color="destructive"
            title="Excluir conta e dados"
            description="Para excluir sua conta e todos os seus dados do FIOROTE, envie um e-mail com o assunto indicado a partir do e-mail cadastrado na sua conta."
            email={email}
            subject="Solicitar exclusão de conta — FIOROTE"
            label="Solicitar exclusão"
            tip="Após a solicitação, todos os seus dados serão removidos permanentemente em até 30 dias."
          />
        </div>

        {/* Contact block */}
        <div className="mt-12 rounded-2xl border border-border bg-muted/30 px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Mail className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold">E-mail de suporte</p>
              <a
                href={`mailto:${email}`}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {email}
              </a>
            </div>
          </div>
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
            Respondemos em até <strong className="text-foreground">2 dias úteis</strong>. Para agilizar, inclua no e-mail o assunto do contato e o e-mail cadastrado na sua conta FIOROTE.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-border py-8 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FIOROTE — Todos os direitos reservados.{" "}
        <Link to="/politica-de-privacidade" className="underline-offset-4 hover:underline">
          Política de Privacidade
        </Link>
      </footer>
    </div>
  );
}

type CardColor = "primary" | "amber" | "orange" | "destructive";

const colorMap: Record<CardColor, { icon: string; badge: string }> = {
  primary:     { icon: "bg-primary/10 text-primary",         badge: "bg-primary/10 text-primary" },
  amber:       { icon: "bg-amber-500/10 text-amber-500",     badge: "bg-amber-500/10 text-amber-600" },
  orange:      { icon: "bg-orange-500/10 text-orange-500",   badge: "bg-orange-500/10 text-orange-600" },
  destructive: { icon: "bg-destructive/10 text-destructive", badge: "bg-destructive/10 text-destructive" },
};

function ContactCard({
  icon,
  color,
  title,
  description,
  email,
  subject,
  label,
  tip,
}: {
  icon: React.ReactNode;
  color: CardColor;
  title: string;
  description: string;
  email: string;
  subject: string;
  label: string;
  tip?: string;
}) {
  const c = colorMap[color];

  return (
    <div className="flex flex-col rounded-2xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className={`mb-4 flex h-10 w-10 items-center justify-center rounded-xl ${c.icon}`}>
        {icon}
      </div>
      <h2 className="mb-2 text-sm font-bold">{title}</h2>
      <p className="mb-4 flex-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
      {tip && (
        <p className={`mb-4 rounded-lg px-3 py-2 text-xs leading-relaxed ${c.badge}`}>
          {tip}
        </p>
      )}
      <a
        href={`mailto:${email}?subject=${encodeURIComponent(subject)}`}
        className="flex items-center justify-center gap-2 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold transition-colors hover:bg-muted"
      >
        <Mail className="h-3.5 w-3.5" />
        {label}
      </a>
    </div>
  );
}
