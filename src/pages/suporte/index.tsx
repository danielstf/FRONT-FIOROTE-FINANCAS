import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  HelpCircle,
  Lightbulb,
  Loader2,
  Mail,
  MessageCircleWarning,
  MessageSquareText,
  Send,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { contatosApi } from "../../api/contatos/contatos-api";
import { getApiErrorMessage } from "../../api/errors";
import { BrandLogo } from "../../components/brand-logo";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { cn } from "../../lib/utils";

const SUPPORT_EMAIL = "fioroteaplicativos@gmail.com";

type Tipo = "SUGESTAO" | "ELOGIO" | "RECLAMACAO" | "OUTRO";

const tipos: Array<{
  value: Tipo;
  label: string;
  description: string;
  icon: typeof Lightbulb;
  color: string;
  ring: string;
}> = [
  {
    value: "SUGESTAO",
    label: "Sugestão",
    description: "Ideias para melhorar o sistema",
    icon: Lightbulb,
    color: "border-amber-500/30 bg-amber-500/8 text-amber-600 dark:text-amber-400",
    ring: "border-amber-500/40 bg-amber-500/5 ring-2 ring-amber-500/15",
  },
  {
    value: "ELOGIO",
    label: "Elogio",
    description: "Conte o que funcionou bem",
    icon: HeartHandshake,
    color: "border-emerald-500/30 bg-emerald-500/8 text-emerald-600 dark:text-emerald-400",
    ring: "border-emerald-500/40 bg-emerald-500/5 ring-2 ring-emerald-500/15",
  },
  {
    value: "RECLAMACAO",
    label: "Reclamação",
    description: "Algo que atrapalhou sua experiência",
    icon: MessageCircleWarning,
    color: "border-rose-500/30 bg-rose-500/8 text-rose-600 dark:text-rose-400",
    ring: "border-rose-500/40 bg-rose-500/5 ring-2 ring-rose-500/15",
  },
  {
    value: "OUTRO",
    label: "Dúvida / Outro",
    description: "Qualquer outra solicitação",
    icon: MessageSquareText,
    color: "border-blue-500/30 bg-blue-500/8 text-blue-600 dark:text-blue-400",
    ring: "border-blue-500/40 bg-blue-500/5 ring-2 ring-blue-500/15",
  },
];

export function SuportePage() {
  const [tipo, setTipo] = useState<Tipo>("SUGESTAO");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nomeVal = nome.trim();
    const emailVal = email.trim();
    const tituloVal = titulo.trim();
    const mensagemVal = mensagem.trim();

    if (!nomeVal || !emailVal || !tituloVal || !mensagemVal) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      await contatosApi.criar({
        tipo,
        titulo: tituloVal,
        mensagem: mensagemVal,
        nome: nomeVal,
        email: emailVal,
      });
      setEnviado(true);
      setNome("");
      setEmail("");
      setTitulo("");
      setMensagem("");
      setTipo("SUGESTAO");
    } catch (err) {
      toast.error(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <BrandLogo size="nav" />
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao site
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-4 py-10">
        {/* Hero */}
        <div className="mb-8 space-y-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <HelpCircle className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Central de Suporte</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Envie sugestões, elogios, reclamações ou dúvidas. Nossa equipe responde em até 2 dias úteis.
            </p>
          </div>
        </div>

        {enviado ? (
          /* ── Estado de sucesso ── */
          <div className="flex flex-col items-center gap-5 rounded-2xl border border-border bg-card px-6 py-14 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold">Mensagem preparada!</h2>
              <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
                Sua mensagem foi enviada para nossa equipe. Retornaremos em até 2 dias úteis.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Dúvidas urgentes? Fale diretamente:{" "}
              <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-primary underline-offset-4 hover:underline">
                {SUPPORT_EMAIL}
              </a>
            </p>
            <button
              onClick={() => setEnviado(false)}
              className="mt-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Enviar outra mensagem
            </button>
          </div>
        ) : (
          /* ── Formulário ── */
          <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Send className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-semibold">Nova mensagem</p>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-6">
              {/* Seletor de tipo */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-muted-foreground">Tipo de mensagem</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {tipos.map((opcao) => {
                    const Icon = opcao.icon;
                    const selected = tipo === opcao.value;
                    return (
                      <button
                        key={opcao.value}
                        type="button"
                        onClick={() => setTipo(opcao.value)}
                        className={cn(
                          "flex flex-col items-start gap-2 rounded-xl border p-3.5 text-left transition-all hover:border-primary/30",
                          selected ? opcao.ring : "border-border bg-background",
                        )}
                      >
                        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg border", opcao.color)}>
                          <Icon className="h-4 w-4" />
                        </span>
                        <span className="block text-xs font-semibold leading-tight">{opcao.label}</span>
                        <span className="block text-[11px] leading-snug text-muted-foreground">{opcao.description}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Nome + Email */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="nome" className="text-xs font-medium text-muted-foreground">Nome</Label>
                  <Input
                    id="nome"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    placeholder="Seu nome"
                    className="h-10"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-xs font-medium text-muted-foreground">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="h-10"
                    required
                  />
                </div>
              </div>

              {/* Título */}
              <div className="space-y-1.5">
                <Label htmlFor="titulo" className="text-xs font-medium text-muted-foreground">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Melhorar filtro de despesas"
                  className="h-10"
                  required
                />
              </div>

              {/* Mensagem */}
              <div className="space-y-1.5">
                <Label htmlFor="mensagem" className="text-xs font-medium text-muted-foreground">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva com detalhes para que possamos entender melhor e te responder."
                  className="min-h-32 resize-none"
                  required
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between gap-4">
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  Sua mensagem abrirá o cliente de e-mail pré-preenchida.
                </p>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-55 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Enviar mensagem
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Contato direto */}
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-border bg-muted/30 px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Mail className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold">Contato direto por e-mail</p>
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              className="text-xs font-medium text-primary underline-offset-4 hover:underline truncate block"
            >
              {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </main>

      <footer className="mt-12 border-t border-border py-7 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} FIOROTE — Todos os direitos reservados.{" "}
        <Link to="/politica-de-privacidade" className="underline-offset-4 hover:underline">
          Política de Privacidade
        </Link>
      </footer>
    </div>
  );
}
