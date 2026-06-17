import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Crown,
  Globe,
  HeartHandshake,
  Lightbulb,
  Loader2,
  MessageCircleWarning,
  MessageSquareText,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { getApiErrorMessage } from "../../api/errors";
import { sugestoesApi } from "../../api/sugestoes/sugestoes-api";
import type { Sugestao, SugestaoTipo } from "../../api/sugestoes/types";
import { contatosApi } from "../../api/contatos/contatos-api";
import type { ContatoSuporte } from "../../api/contatos/types";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { cn } from "../../lib/utils";
import { useAuth } from "../../providers/auth-provider";

const tipoConfig: Record<SugestaoTipo, { label: string; icon: typeof Lightbulb; className: string }> = {
  SUGESTAO:   { label: "Sugestão",   icon: Lightbulb,            className: "bg-amber-500/10 text-amber-700 dark:text-amber-400" },
  RECLAMACAO: { label: "Reclamação", icon: MessageCircleWarning,  className: "bg-rose-500/10 text-rose-700 dark:text-rose-400" },
  ELOGIO:     { label: "Elogio",     icon: HeartHandshake,        className: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400" },
  OUTRO:      { label: "Outro",      icon: MessageSquareText,     className: "bg-blue-500/10 text-blue-700 dark:text-blue-400" },
};

const statusBadge = (status: string) =>
  status === "FINALIZADO"
    ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
    : "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-400";

export function GestaoPage() {
  const { session } = useAuth();

  const [sugestoes, setSugestoes] = useState<Sugestao[]>([]);
  const [contatos, setContatos] = useState<ContatoSuporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [sugestaoExcluindo, setSugestaoExcluindo] = useState<Sugestao | null>(null);
  const [contatoExcluindo, setContatoExcluindo] = useState<ContatoSuporte | null>(null);

  useEffect(() => {
    if (session?.usuario.role !== "ADMIN") return;

    async function carregar() {
      setError("");
      setLoading(true);
      try {
        const [s, c] = await Promise.all([sugestoesApi.listar(), contatosApi.listar()]);
        setSugestoes(s.sugestoes);
        setContatos(c.contatos);
      } catch (err) {
        setError(getApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    }

    void carregar();
  }, [session?.usuario.role]);

  if (session?.usuario.role !== "ADMIN") return <Navigate to="/app" replace />;

  async function finalizarSugestao(item: Sugestao) {
    setBusyId(item.id);
    try {
      const atualizada = await sugestoesApi.finalizar(item.id);
      setSugestoes((prev) => prev.map((s) => (s.id === atualizada.id ? atualizada : s)));
      toast.success("Chamado finalizado.");
    } catch (err) { toast.error(getApiErrorMessage(err)); }
    finally { setBusyId(null); }
  }

  async function excluirSugestao() {
    if (!sugestaoExcluindo) return;
    setBusyId(sugestaoExcluindo.id);
    try {
      await sugestoesApi.excluir(sugestaoExcluindo.id);
      setSugestoes((prev) => prev.filter((s) => s.id !== sugestaoExcluindo.id));
      setSugestaoExcluindo(null);
      toast.success("Chamado excluído.");
    } catch (err) { toast.error(getApiErrorMessage(err)); }
    finally { setBusyId(null); }
  }

  async function finalizarContato(item: ContatoSuporte) {
    setBusyId(item.id);
    try {
      const atualizado = await contatosApi.finalizar(item.id);
      setContatos((prev) => prev.map((c) => (c.id === atualizado.id ? atualizado : c)));
      toast.success("Chamado finalizado.");
    } catch (err) { toast.error(getApiErrorMessage(err)); }
    finally { setBusyId(null); }
  }

  async function excluirContato() {
    if (!contatoExcluindo) return;
    setBusyId(contatoExcluindo.id);
    try {
      await contatosApi.excluir(contatoExcluindo.id);
      setContatos((prev) => prev.filter((c) => c.id !== contatoExcluindo.id));
      setContatoExcluindo(null);
      toast.success("Chamado excluído.");
    } catch (err) { toast.error(getApiErrorMessage(err)); }
    finally { setBusyId(null); }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <section className="rounded-lg border border-border bg-card p-5 shadow-sm lg:p-7">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium uppercase text-primary">
            <ShieldAlert className="h-4 w-4" />
            Gestão
          </div>
          <h1 className="text-2xl font-semibold uppercase tracking-normal lg:text-3xl">Mensagens recebidas</h1>
          <p className="text-sm text-muted-foreground">
            Área administrativa para visualizar reclamações, elogios, sugestões e outras mensagens enviadas pelos usuários.
          </p>
        </div>
      </section>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando mensagens...
        </div>
      )}
      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
      )}

      {/* Sugestões de usuários logados */}
      {!loading && (
        <MensagensCard
          title="Mensagens de usuários"
          description="Enviadas pelo painel interno (usuários logados)."
          icon={MessageSquareText}
          empty={sugestoes.length === 0}
          items={sugestoes.map((item) => ({
            id: item.id,
            tipo: item.tipo,
            titulo: item.titulo,
            mensagem: item.mensagem,
            status: item.status,
            criadoEm: item.criadoEm,
            autor: `${item.usuario.nome} | ${item.usuario.email}`,
            vip: item.usuario.plano === "PREMIUM",
          }))}
          busyId={busyId}
          onFinalizar={(id) => { const item = sugestoes.find((s) => s.id === id); if (item) finalizarSugestao(item); }}
          onExcluir={(id) => { const item = sugestoes.find((s) => s.id === id); if (item) setSugestaoExcluindo(item); }}
        />
      )}

      {/* Contatos públicos */}
      {!loading && (
        <MensagensCard
          title="Contatos do site"
          description="Enviados pela página de suporte público (sem login)."
          icon={Globe}
          empty={contatos.length === 0}
          items={contatos.map((item) => ({
            id: item.id,
            tipo: item.tipo,
            titulo: item.titulo,
            mensagem: item.mensagem,
            status: item.status,
            criadoEm: item.criadoEm,
            autor: `${item.nome} | ${item.email}`,
          }))}
          busyId={busyId}
          onFinalizar={(id) => { const item = contatos.find((c) => c.id === id); if (item) finalizarContato(item); }}
          onExcluir={(id) => { const item = contatos.find((c) => c.id === id); if (item) setContatoExcluindo(item); }}
        />
      )}

      {/* Dialog excluir sugestão */}
      <Dialog open={Boolean(sugestaoExcluindo)} onOpenChange={(open) => { if (!open) setSugestaoExcluindo(null); }}>
        <ExcluirDialog
          titulo={sugestaoExcluindo?.titulo}
          autor={sugestaoExcluindo ? `${sugestaoExcluindo.usuario.nome} | ${sugestaoExcluindo.usuario.email}` : undefined}
          busy={busyId === sugestaoExcluindo?.id}
          onCancel={() => setSugestaoExcluindo(null)}
          onConfirm={excluirSugestao}
        />
      </Dialog>

      {/* Dialog excluir contato */}
      <Dialog open={Boolean(contatoExcluindo)} onOpenChange={(open) => { if (!open) setContatoExcluindo(null); }}>
        <ExcluirDialog
          titulo={contatoExcluindo?.titulo}
          autor={contatoExcluindo ? `${contatoExcluindo.nome} | ${contatoExcluindo.email}` : undefined}
          busy={busyId === contatoExcluindo?.id}
          onCancel={() => setContatoExcluindo(null)}
          onConfirm={excluirContato}
        />
      </Dialog>
    </div>
  );
}

type ItemRow = {
  id: string;
  tipo: SugestaoTipo;
  titulo: string;
  mensagem: string;
  status: string;
  criadoEm: string;
  autor: string;
  vip?: boolean;
};

function MensagensCard({
  title,
  description,
  icon: Icon,
  empty,
  items,
  busyId,
  onFinalizar,
  onExcluir,
}: {
  title: string;
  description: string;
  icon: typeof MessageSquareText;
  empty: boolean;
  items: ItemRow[];
  busyId: string | null;
  onFinalizar: (id: string) => void;
  onExcluir: (id: string) => void;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="h-3.5 w-3.5" />
        </div>
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        <span className="ml-auto rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
          {items.length}
        </span>
      </div>

      {empty ? (
        <div className="rounded-lg border border-dashed border-border bg-muted/35 m-4 p-8 text-center">
          <p className="font-medium text-foreground">Nenhuma mensagem recebida.</p>
          <p className="mt-1 text-sm text-muted-foreground">As novas mensagens aparecerão aqui.</p>
        </div>
      ) : (
        <div className="grid gap-3 p-4">
          {items.map((item) => {
            const config = tipoConfig[item.tipo];
            const Icon2 = config.icon;
            return (
              <article key={item.id} className="rounded-lg border border-border bg-background p-4 shadow-sm">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 gap-3">
                    <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md", config.className)}>
                      <Icon2 className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-semibold uppercase text-primary">{config.label}</p>
                        {item.vip && (
                          <span className="inline-flex items-center gap-1 rounded-md bg-amber-400/15 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-500">
                            <Crown className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            VIP
                          </span>
                        )}
                      </div>
                      <h2 className="truncate font-semibold text-foreground">{item.titulo}</h2>
                      <p className="mt-1 text-xs text-muted-foreground">{item.autor}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2 sm:justify-end">
                    <span className={cn("rounded-md border px-2 py-1 text-[10px] font-semibold uppercase", statusBadge(item.status))}>
                      {item.status === "FINALIZADO" ? "Finalizado" : "Aberto"}
                    </span>
                    <time className="text-xs text-muted-foreground">
                      {new Date(item.criadoEm).toLocaleString("pt-BR")}
                    </time>
                    {item.status !== "FINALIZADO" && (
                      <Button className="h-8 px-2 text-xs" disabled={busyId === item.id} variant="outline" onClick={() => onFinalizar(item.id)}>
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Finalizar
                      </Button>
                    )}
                    <Button className="h-8 px-2 text-xs" disabled={busyId === item.id} variant="destructive" onClick={() => onExcluir(item.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                      Excluir
                    </Button>
                  </div>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{item.mensagem}</p>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ExcluirDialog({
  titulo,
  autor,
  busy,
  onCancel,
  onConfirm,
}: {
  titulo?: string;
  autor?: string;
  busy: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Excluir chamado</DialogTitle>
        <DialogDescription>Confirme para remover definitivamente esta mensagem.</DialogDescription>
      </DialogHeader>
      <div className="rounded-lg border border-border bg-muted/35 p-4 text-sm">
        <p className="font-semibold text-foreground">{titulo}</p>
        <p className="mt-1 text-xs text-muted-foreground">{autor}</p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button variant="destructive" onClick={onConfirm} disabled={busy}>
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          Excluir chamado
        </Button>
      </div>
    </DialogContent>
  );
}
