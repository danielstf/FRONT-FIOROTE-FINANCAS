import { useEffect, useState } from "react";
import {
  HeartHandshake,
  Lightbulb,
  Loader2,
  MessageCircleWarning,
  MessageSquareText,
  ShieldAlert,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { sugestoesApi } from "../../api/sugestoes/sugestoes-api";
import type { Sugestao, SugestaoTipo } from "../../api/sugestoes/types";
import { getApiErrorMessage } from "../../api/errors";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { useAuth } from "../../providers/auth-provider";
import { cn } from "../../lib/utils";

const tipoConfig: Record<
  SugestaoTipo,
  {
    label: string;
    icon: typeof Lightbulb;
    className: string;
  }
> = {
  SUGESTAO: {
    label: "Sugestão",
    icon: Lightbulb,
    className: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  RECLAMACAO: {
    label: "Reclamação",
    icon: MessageCircleWarning,
    className: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  ELOGIO: {
    label: "Elogio",
    icon: HeartHandshake,
    className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  OUTRO: {
    label: "Outro",
    icon: MessageSquareText,
    className: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
};

export function GestaoPage() {
  const { session } = useAuth();
  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.usuario.role !== "ADMIN") return;

    async function carregarSugestoes() {
      setError("");
      setLoading(true);

      try {
        const data = await sugestoesApi.listar();
        setSugestoes(data.sugestoes);
      } catch (requestError) {
        setError(getApiErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    void carregarSugestoes();
  }, [session?.usuario.role]);

  if (session?.usuario.role !== "ADMIN") {
    return <Navigate to="/app" replace />;
  }

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:p-7">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium uppercase text-primary">
            <ShieldAlert className="h-4 w-4" />
            Gestão
          </div>
          <h1 className="text-2xl font-semibold uppercase tracking-normal lg:text-3xl">
            Sugestões recebidas
          </h1>
          <p className="text-sm text-muted-foreground">
            Área administrativa para visualizar reclamações, elogios, sugestões e
            outras mensagens enviadas pelos usuários.
          </p>
        </div>
      </section>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-base uppercase tracking-normal">
            Mensagens dos usuários
          </CardTitle>
          <CardDescription>
            Cada mensagem exibe nome e e-mail de quem enviou.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Carregando sugestões...
            </div>
          )}

          {error && (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          {!loading && !error && sugestoes.length === 0 && (
            <div className="rounded-lg border border-dashed border-border bg-muted/35 p-8 text-center">
              <p className="font-medium text-foreground">
                Nenhuma sugestão recebida.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                As novas mensagens aparecerão aqui.
              </p>
            </div>
          )}

          {!loading && sugestoes.length > 0 && (
            <div className="grid gap-3">
              {sugestoes.map((item) => {
                const config = tipoConfig[item.tipo];
                const Icon = config.icon;

                return (
                  <article
                    className="rounded-lg border border-border bg-background p-4 shadow-sm"
                    key={item.id}
                  >
                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                      <div className="flex min-w-0 gap-3">
                        <span
                          className={cn(
                            "flex h-10 w-10 shrink-0 items-center justify-center rounded-md",
                            config.className,
                          )}
                        >
                          <Icon className="h-5 w-5" />
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold uppercase text-primary">
                            {config.label}
                          </p>
                          <h2 className="truncate font-semibold text-foreground">
                            {item.titulo}
                          </h2>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {item.usuario.nome} | {item.usuario.email}
                          </p>
                        </div>
                      </div>
                      <time className="text-xs text-muted-foreground">
                        {new Date(item.criadoEm).toLocaleString("pt-BR")}
                      </time>
                    </div>
                    <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">
                      {item.mensagem}
                    </p>
                  </article>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
