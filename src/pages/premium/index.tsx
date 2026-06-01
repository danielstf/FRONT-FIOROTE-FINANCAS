import { useEffect, useState } from "react";
import {
  BarChart3,
  Ban,
  CreditCard,
  Crown,
  FileDown,
  Loader2,
  RefreshCw,
  Users,
  XCircle,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import { getApiErrorMessage } from "../../api/errors";
import { pagamentosApi } from "../../api/pagamentos/pagamentos-api";
import type {
  PremiumCheckoutTipo,
  PremiumStatusResponse,
} from "../../api/pagamentos/types";
import { PageHeader } from "../../components/page-header";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { pageVariants, sectionVariants } from "../../lib/motion";
import { useAuth } from "../../providers/auth-provider";

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const BENEFICIOS = [
  { icon: Ban, label: "Sem anúncios", desc: "Experiência limpa e sem distrações." },
  { icon: BarChart3, label: "Relatórios avançados", desc: "Visualize receitas, despesas e tendências." },
  { icon: Users, label: "Até 5 perfis financeiros", desc: "Separe finanças pessoais, empresariais e mais." },
  { icon: RefreshCw, label: "Lançamentos fixos", desc: "Receitas e despesas recorrentes automáticas." },
  { icon: FileDown, label: "Exportação de dados", desc: "Exporte relatórios em Excel com um clique." },
  { icon: Zap, label: "Acesso imediato", desc: "Ativado assim que o pagamento é confirmado." },
];

export function PremiumPage() {
  const { atualizarUsuarioSessao } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState<PremiumCheckoutTipo | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelarOpen, setCancelarOpen] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isPremium = Boolean(premiumStatus?.premium);
  const checkoutUrl = premiumStatus?.ultimoPagamento?.checkoutUrl ?? null;
  const hasPendingPayment = premiumStatus?.ultimoPagamento?.status === "PENDING";
  const isAssinatura = premiumStatus?.ultimoPagamento?.tipo === "ASSINATURA";
  const isCancelado = Boolean(premiumStatus?.ultimoPagamento?.canceladoEm);
  const precoMensal = premiumStatus?.precos.mensal ?? 8;
  const precoRecorrente = premiumStatus?.precos.recorrente ?? 5;

  async function carregarStatus() {
    setError("");
    setLoadingStatus(true);
    try {
      const data = await pagamentosApi.consultarPremium();
      setPremiumStatus(data);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingStatus(false);
    }
  }

  async function criarCheckout(tipo: PremiumCheckoutTipo) {
    setError("");
    setMessage("");
    setLoadingCheckout(tipo);
    try {
      const data = await pagamentosApi.criarCheckoutPremium(tipo);
      const paymentUrl = data.checkoutUrl ?? data.sandboxCheckoutUrl;
      if (!paymentUrl) throw new Error("Não foi possível iniciar o pagamento.");
      window.location.href = paymentUrl;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingCheckout(null);
    }
  }

  async function confirmarCancelamento() {
    setError("");
    setMessage("");
    setLoadingCancel(true);
    try {
      const data = await pagamentosApi.cancelarPremium();
      atualizarUsuarioSessao(data.usuario);
      setMessage("Cancelamento confirmado. Seu Premium fica ativo até a validade paga.");
      setCancelarOpen(false);
      await carregarStatus();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingCancel(false);
    }
  }

  useEffect(() => {
    void carregarStatus();
  }, []);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-2xl space-y-5"
    >
      {/* Header */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          icon={Crown}
          iconClassName="bg-amber-400/15 text-amber-400"
          title="Plano VIP"
          subtitle={isPremium ? "Sua assinatura está ativa" : "Desbloqueie o acesso completo"}
        />
      </motion.div>

      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </motion.p>
      )}
      {message && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-500"
        >
          {message}
        </motion.p>
      )}

      {loadingStatus ? (
        <motion.div
          variants={sectionVariants}
          className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground"
        >
          <Loader2 className="h-4 w-4 animate-spin" /> Verificando plano...
        </motion.div>
      ) : isPremium ? (
        /* ── Premium ativo ─────────────────────────── */
        <motion.div variants={sectionVariants} className="overflow-hidden rounded-2xl border border-amber-400/25 bg-card">
          <div className="relative overflow-hidden px-6 py-8 bg-linear-to-br from-amber-400/10 via-card to-card">
            <div
              aria-hidden
              className="pointer-events-none absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-amber-400/20 blur-3xl"
            />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-400">
                  <Crown className="h-3.5 w-3.5" />
                  {isCancelado ? "Cancelado" : "VIP Ativo"}
                </div>
                <h2 className="text-2xl font-bold">
                  {isCancelado ? "Assinatura cancelada" : "Assinatura Premium"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {isCancelado
                    ? "Seu acesso continua válido até o fim do período pago."
                    : isAssinatura
                      ? "Renovação automática mensal ativa."
                      : "Acesso mensal avulso."}
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:items-end shrink-0">
                <div className="rounded-xl border border-border bg-background/60 px-5 py-4 text-center min-w-36">
                  <p className="text-xs text-muted-foreground">Validade</p>
                  <p className="mt-1 text-lg font-bold">
                    {premiumStatus?.premiumExpiraEm
                      ? formatDateOnly(premiumStatus.premiumExpiraEm)
                      : "—"}
                  </p>
                  {premiumStatus?.premiumDiasRestantes !== undefined && (
                    <p className="mt-0.5 text-xs font-semibold text-amber-400">
                      {premiumStatus.premiumDiasRestantes} dias restantes
                    </p>
                  )}
                </div>
                {!isCancelado && (
                  <Button
                    variant="outline"
                    onClick={() => setCancelarOpen(true)}
                    disabled={loadingCancel}
                    className="h-9 gap-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
                  >
                    <XCircle className="h-3.5 w-3.5" />
                    Cancelar assinatura
                  </Button>
                )}
              </div>
            </div>
          </div>

          <div className="grid border-t border-border/60 sm:grid-cols-3 divide-y divide-border/60 sm:divide-y-0 sm:divide-x sm:divide-border/60">
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">Anúncios</p>
              <p className="mt-1 text-sm font-semibold">
                {premiumStatus?.exibirAnuncios ? "Ativos" : "Removidos"}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">Cobrança</p>
              <p className="mt-1 text-sm font-semibold">
                {isCancelado ? "Cancelada" : isAssinatura ? "Recorrente" : "Avulso"}
              </p>
            </div>
            <div className="px-5 py-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <p className="mt-1 text-sm font-semibold">
                {premiumStatus?.ultimoPagamento?.assinaturaStatus ?? "—"}
              </p>
            </div>
          </div>
        </motion.div>
      ) : (
        /* ── Tela de compra ────────────────────────── */
        <>
          {/* Hero */}
          <motion.div
            variants={sectionVariants}
            className="relative overflow-hidden rounded-2xl border border-amber-400/25 bg-linear-to-br from-amber-400/10 via-card to-card px-6 py-8 text-center"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 h-32 w-64 -translate-x-1/2 -translate-y-8 rounded-full bg-amber-400/15 blur-3xl"
            />
            <Crown className="mx-auto mb-3 h-10 w-10 text-amber-400" />
            <h2 className="text-2xl font-bold">Torne-se VIP</h2>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground">
              Acesso completo ao Fiorote — relatórios, múltiplos perfis financeiros
              e experiência sem anúncios.
            </p>
          </motion.div>

          {/* Benefícios */}
          <motion.div variants={sectionVariants} className="rounded-2xl border border-border bg-card p-5">
            <p className="mb-4 text-sm font-semibold text-foreground">
              O que está incluído no VIP
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {BENEFICIOS.map((b) => (
                <div key={b.label} className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-400/10 text-amber-400">
                    <b.icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium leading-tight">{b.label}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Opções de pagamento */}
          <motion.div variants={sectionVariants} className="grid gap-4 sm:grid-cols-2">
            {/* Compra avulsa */}
            <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="flex-1 space-y-1">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                  Compra avulsa
                </p>
                <p className="text-3xl font-bold">{formatMoney(precoMensal)}</p>
                <p className="text-sm text-muted-foreground">
                  Acesso por 30 dias, pague uma vez.
                </p>
              </div>
              <Button
                variant="outline"
                className="h-11 w-full gap-2"
                onClick={() => criarCheckout("MENSAL")}
                disabled={Boolean(loadingCheckout)}
              >
                {loadingCheckout === "MENSAL" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Comprar acesso
              </Button>
            </div>

            {/* Assinatura recorrente — destaque */}
            <div className="relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-amber-400/40 bg-linear-to-b from-amber-400/10 to-card p-5">
              <div
                aria-hidden
                className="pointer-events-none absolute right-0 top-0 h-24 w-24 -translate-y-6 translate-x-6 rounded-full bg-amber-400/20 blur-2xl"
              />
              <div className="absolute right-4 top-4">
                <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-amber-400">
                  RECOMENDADO
                </span>
              </div>
              <div className="flex-1 space-y-1 pr-24">
                <p className="text-[11px] font-semibold uppercase tracking-widest text-amber-400">
                  Compra assinatura
                </p>
                <p className="text-3xl font-bold">
                  {formatMoney(precoRecorrente)}
                  <span className="text-base font-medium text-muted-foreground">/mês</span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Renovação automática, cancele quando quiser.
                </p>
              </div>
              <Button
                className="h-11 w-full gap-2 bg-amber-400 text-slate-900 hover:bg-amber-300"
                onClick={() => criarCheckout("RECORRENTE")}
                disabled={Boolean(loadingCheckout)}
              >
                {loadingCheckout === "RECORRENTE" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Crown className="h-4 w-4" />
                )}
                Assinar agora
              </Button>
            </div>
          </motion.div>

          {/* Pagamento pendente */}
          {checkoutUrl && hasPendingPayment && (
            <motion.div
              variants={sectionVariants}
              className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4"
            >
              <p className="text-sm font-semibold text-amber-500">Pagamento pendente</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Você tem um checkout em aberto. Continue ou inicie um novo acima.
              </p>
              <Button asChild className="mt-3 h-9 gap-2">
                <a href={checkoutUrl}>
                  <CreditCard className="h-3.5 w-3.5" />
                  Continuar pagamento
                </a>
              </Button>
            </motion.div>
          )}
        </>
      )}

      {/* ── Dialog: Cancelar assinatura ── */}
      <Dialog open={cancelarOpen} onOpenChange={setCancelarOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar assinatura</DialogTitle>
            <DialogDescription>
              A cobrança recorrente será interrompida. Seu acesso Premium continua ativo até o fim do período já pago.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
            Esta ação não pode ser desfeita. Após o cancelamento, você precisará assinar novamente para reativar.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setCancelarOpen(false)}>
              Manter assinatura
            </Button>
            <Button
              variant="destructive"
              onClick={confirmarCancelamento}
              disabled={loadingCancel}
              className="gap-2"
            >
              {loadingCancel && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar cancelamento
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
