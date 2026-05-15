import { useState, type FormEvent } from "react";
import {
  HeartHandshake,
  Lightbulb,
  Loader2,
  MessageCircleWarning,
  MessageSquareText,
  Send,
} from "lucide-react";
import { toast } from "sonner";
import { sugestoesApi } from "../../api/sugestoes/sugestoes-api";
import type { SugestaoTipo } from "../../api/sugestoes/types";
import { getApiErrorMessage } from "../../api/errors";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { cn } from "../../lib/utils";
import { normalizeRequiredText } from "../../lib/text";

const tipos = [
  {
    value: "SUGESTAO",
    label: "Sugestão",
    description: "Ideias para melhorar o sistema.",
    icon: Lightbulb,
    className: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  {
    value: "RECLAMACAO",
    label: "Reclamação",
    description: "Algo que atrapalhou sua experiência.",
    icon: MessageCircleWarning,
    className: "border-rose-500/25 bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  {
    value: "ELOGIO",
    label: "Elogio",
    description: "Conte o que funcionou bem.",
    icon: HeartHandshake,
    className:
      "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  {
    value: "OUTRO",
    label: "Outro",
    description: "Dúvidas, solicitações ou observações.",
    icon: MessageSquareText,
    className: "border-blue-500/25 bg-blue-500/10 text-blue-700 dark:text-blue-400",
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

  async function enviarSugestao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const tituloNormalizado = normalizeRequiredText(titulo);
    const mensagemNormalizada = mensagem.trim();

    if (!tituloNormalizado) {
      toast.error("Informe um título.");
      return;
    }

    if (!mensagemNormalizada) {
      toast.error("Descreva sua mensagem.");
      return;
    }

    setLoading(true);

    try {
      await sugestoesApi.criar({
        tipo,
        titulo: tituloNormalizado,
        mensagem: mensagemNormalizada,
      });

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
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:p-7">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium uppercase text-primary">
            <MessageSquareText className="h-4 w-4" />
            Atendimento
          </div>
          <h1 className="text-2xl font-semibold uppercase tracking-normal lg:text-3xl">
            Envie uma sugestão, reclamação ou elogio
          </h1>
          <p className="text-sm text-muted-foreground">
            Sua mensagem será enviada com seu nome e e-mail para a equipe responsável.
          </p>
        </div>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-normal">
            Tipo de mensagem
          </CardTitle>
          <CardDescription>
            Escolha a opção que melhor descreve o que você quer enviar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="grid gap-5" onSubmit={enviarSugestao}>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {tipos.map((opcao) => {
                const Icon = opcao.icon;
                const selected = tipo === opcao.value;

                return (
                  <button
                    key={opcao.value}
                    type="button"
                    className={cn(
                      "rounded-lg border border-border bg-background p-4 text-left shadow-sm transition-colors hover:border-primary/35 hover:bg-card",
                      selected && "border-primary/40 ring-2 ring-primary/10",
                    )}
                    onClick={() => setTipo(opcao.value)}
                  >
                    <span
                      className={cn(
                        "mb-3 flex h-10 w-10 items-center justify-center rounded-md border",
                        opcao.className,
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="block font-semibold uppercase">{opcao.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {opcao.description}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="grid gap-4 lg:grid-cols-[360px_1fr]">
              <div className="space-y-2">
                <Label htmlFor="titulo">Título</Label>
                <Input
                  id="titulo"
                  value={titulo}
                  onChange={(event) => setTitulo(event.target.value)}
                  placeholder="Ex: Melhorar relatório mensal"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mensagem">Mensagem</Label>
                <textarea
                  id="mensagem"
                  className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20"
                  value={mensagem}
                  onChange={(event) => setMensagem(event.target.value)}
                  placeholder="Descreva com detalhes para a equipe entender melhor."
                  required
                />
              </div>
            </div>

            <div>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
                Enviar mensagem
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
