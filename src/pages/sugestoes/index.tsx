import { useState } from "react";
import {
  HeartHandshake,
  Lightbulb,
  Loader2,
  Mail,
  MessageCircleWarning,
  MessageSquareText,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { sugestoesApi } from "../../api/sugestoes/sugestoes-api";
import type { SugestaoTipo } from "../../api/sugestoes/types";
import { getApiErrorMessage } from "../../api/errors";
import { PageHeader } from "../../components/page-header";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Textarea } from "../../components/ui/textarea";
import { pageVariants, sectionVariants } from "../../lib/motion";
import { cn } from "../../lib/utils";
import { normalizeRequiredText } from "../../lib/text";

const tipos = [
  {
    value: "SUGESTAO",
    label: "Sugestão",
    description: "Ideias para melhorar o sistema.",
    icon: Lightbulb,
    className: "border-amber-500/25 bg-amber-500/10 text-amber-500",
  },
  {
    value: "RECLAMACAO",
    label: "Reclamação",
    description: "Algo que atrapalhou sua experiência.",
    icon: MessageCircleWarning,
    className: "border-rose-500/25 bg-rose-500/10 text-rose-500",
  },
  {
    value: "ELOGIO",
    label: "Elogio",
    description: "Conte o que funcionou bem.",
    icon: HeartHandshake,
    className: "border-emerald-500/25 bg-emerald-500/10 text-emerald-500",
  },
  {
    value: "OUTRO",
    label: "Outro",
    description: "Dúvidas, solicitações ou observações.",
    icon: MessageSquareText,
    className: "border-blue-500/25 bg-blue-500/10 text-blue-500",
  },
] satisfies Array<{
  value: SugestaoTipo;
  label: string;
  description: string;
  icon: typeof Lightbulb;
  className: string;
}>;

export function SugestoesPage() {
  const [tipo, setTipo] = useState<SugestaoTipo>("SUGESTAO");
  const [titulo, setTitulo] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  async function enviarSugestao(event: React.SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    const tituloNormalizado = normalizeRequiredText(titulo);
    const mensagemNormalizada = mensagem.trim();

    if (!tituloNormalizado) { toast.error("Informe um título."); return; }
    if (!mensagemNormalizada) { toast.error("Descreva sua mensagem."); return; }

    setLoading(true);
    try {
      await sugestoesApi.criar({ tipo, titulo: tituloNormalizado, mensagem: mensagemNormalizada });
      setTitulo("");
      setMensagem("");
      setTipo("SUGESTAO");
      toast.success("Mensagem enviada com sucesso.");
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      {/* Page header */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          icon={MessageSquareText}
          title="Suporte"
          subtitle="Envie sugestões, reclamações ou elogios"
        />
      </motion.div>

      {/* Contato por e-mail */}
      <motion.div variants={sectionVariants} className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
            <Mail className="h-3.5 w-3.5" />
          </div>
          <p className="text-sm font-semibold">Contato por e-mail</p>
        </div>
        <div className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Prefere enviar um e-mail diretamente? Entre em contato com nossa equipe.
          </p>
          <a
            href="mailto:fioroteaplicativos@gmail.com"
            className="mt-3 inline-flex shrink-0 items-center gap-2 rounded-xl border border-blue-500/25 bg-blue-500/8 px-4 py-2.5 text-sm font-semibold text-blue-600 transition-colors hover:bg-blue-500/15 dark:text-blue-400 sm:mt-0"
          >
            <Mail className="h-4 w-4" />
            fioroteaplicativos@gmail.com
          </a>
        </div>
      </motion.div>

      {/* Form card */}
      <motion.div variants={sectionVariants} className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Send className="h-3.5 w-3.5" />
          </div>
          <p className="text-sm font-semibold">Nova mensagem</p>
        </div>

        <div className="p-5">
          <form className="grid gap-5" onSubmit={enviarSugestao}>
            {/* Type selector */}
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Tipo de mensagem</p>
              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
                {tipos.map((opcao) => {
                  const Icon = opcao.icon;
                  const selected = tipo === opcao.value;
                  return (
                    <button
                      key={opcao.value}
                      type="button"
                      className={cn(
                        "rounded-xl border bg-background p-3.5 text-left transition-all hover:border-primary/35",
                        selected
                          ? "border-primary/40 bg-primary/5 ring-2 ring-primary/10"
                          : "border-border",
                      )}
                      onClick={() => setTipo(opcao.value)}
                    >
                      <span className={cn("mb-2.5 flex h-8 w-8 items-center justify-center rounded-lg border", opcao.className)}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="block text-sm font-semibold">{opcao.label}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">{opcao.description}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Fields */}
            <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="titulo" className="text-xs font-medium text-muted-foreground">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Melhorar relatório mensal"
                  className="h-10"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem" className="text-xs font-medium text-muted-foreground">Mensagem</Label>
                <Textarea
                  id="mensagem"
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  placeholder="Descreva com detalhes para a equipe entender melhor."
                  className="min-h-28"
                  required
                />
              </div>
            </div>

            <div>
              <Button type="submit" disabled={loading} className="h-10 gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Enviar mensagem
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}
