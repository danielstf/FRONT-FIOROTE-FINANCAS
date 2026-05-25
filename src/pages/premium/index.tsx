import { useEffect, useState } from "react";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Crown,
  Loader2,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { getApiErrorMessage } from "../../api/errors";
import { pagamentosApi } from "../../api/pagamentos/pagamentos-api";
import type {
  PremiumCheckoutTipo,
  PremiumStatusResponse,
} from "../../api/pagamentos/types";
import { Button } from "../../components/ui/button";
import { useAuth } from "../../providers/auth-provider";

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "medium" }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function PremiumPage() {
  const { atualizarUsuarioSessao } = useAuth();
  const [premiumStatus, setPremiumStatus] = useState<PremiumStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState<PremiumCheckoutTipo | null>(null);
  const [loadingCancel, setLoadingCancel] = useState(false);
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

  async function cancelarAssinatura() {
    const confirmed = window.confirm(
      "Cancelar o Premium? A cobrança recorrente será interrompida e seu acesso continua até acabar a validade paga.",
    );
    if (!confirmed) return;
    setError("");
    setMessage("");
    setLoadingCancel(true);
    try {
      const data = await pagamentosApi.cancelarPremium();
      atualizarUsuarioSessao(data.usuario);
      setMessage("Cancelamento confirmado. Seu Premium fica ativo até a validade paga.");
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
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-400/15 text-amber-400">
          <Crown className="h-4.5 w-4.5" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Plano VIP</h1>
          <p className="text-xs text-muted-foreground">
            {isPremium ? "Sua assinatura está ativa" : "Desbloqueie o acesso completo"}
          </p>
        </div>
      </div>

      {error && (
        <p className="rounded-xl border border-destructive/25 bg-destructive/8 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}
      {message && (
        <p className="rounded-xl border border-emerald-500/25 bg-emerald-500/8 px-4 py-3 text-sm text-emerald-500">
          {message}
        </p>
      )}

      {loadingStatus ? (
        <div className="flex items-center gap-2.5 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Verificando plano...
        </div>
      ) : isPremium ? (
        /* Premium ativo */
        <div className="rounded-2xl border border-amber-400/25 bg-card overflow-hidden">
          <div className="relative overflow-hidden px-6 py-8 bg-linear-to-br from-amber-400/10 via-card to-card">
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-40 w-40 -translate-y-10 translate-x-10 rounded-full bg-amber-400/20 blur-3xl" />
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/15 px-3 py-1 text-xs font-semibold text-amber-400">
                  <Crown className="h-3.5 w-3.5" />
                  {isCancelado ? "Cancelado" : "VIP Ativo"}
                </div>
                <h2 className="text-2xl font-bold text-foreground">
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
                  <p className="mt-1 text-lg font-bold text-foreground">
                    {premiumStatus?.premiumExpiraEm ? formatDateOnly(premiumStatus.premiumExpiraEm) : "—"}
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
                    onClick={cancelarAssinatura}
                    disabled={loadingCancel}
                    className="h-9 gap-2 text-xs text-muted-foreground hover:text-destructive hover:border-destructive/40"
                  >
                    {loadingCancel
                      ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      : <XCircle className="h-3.5 w-3.5" />}
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
              <p className="text-xs text-muted-foreground">Status Mercado Pago</p>
              <p className="mt-1 text-sm font-semibold">
                {premiumStatus?.ultimoPagamento?.assinaturaStatus ?? "—"}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* Planos */
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Avulso */}
          <div className="rounded-2xl border border-border bg-card p-6 space-y-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Mensal avulso</p>
              <p className="mt-2 text-3xl font-bold text-foreground">{formatMoney(precoMensal)}</p>
              <p className="mt-1 text-sm text-muted-foreground">Pague uma vez e use por 30 dias.</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> Sem anúncios
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> Acesso imediato
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" /> Sem compromisso mensal
              </li>
            </ul>
            <Button
              className="w-full h-11 gap-2"
              variant="outline"
              onClick={() => criarCheckout("MENSAL")}
              disabled={Boolean(loadingCheckout)}
            >
              {loadingCheckout === "MENSAL"
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <CreditCard className="h-4 w-4" />}
              Comprar por {formatMoney(precoMensal)}
            </Button>
          </div>

          {/* Recorrente — destaque */}
          <div className="relative rounded-2xl border border-amber-400/35 bg-linear-to-b from-amber-400/8 to-card p-6 space-y-5 overflow-hidden">
            <div aria-hidden className="pointer-events-none absolute right-0 top-0 h-28 w-28 -translate-y-8 translate-x-8 rounded-full bg-amber-400/20 blur-2xl" />
            <div className="absolute right-4 top-4">
              <span className="rounded-full bg-amber-400/15 px-2.5 py-0.5 text-[10px] font-black tracking-wider text-amber-400">
                RECOMENDADO
              </span>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-amber-400">Mensal recorrente</p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {formatMoney(precoRecorrente)}
                <span className="text-base font-medium text-muted-foreground">/mês</span>
              </p>
              <p className="mt-1 text-sm text-muted-foreground">Cobrança automática, cancele quando quiser.</p>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" /> Sem anúncios
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" /> Acesso imediato
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-400" /> Cancelamento livre
              </li>
            </ul>
            <Button
              className="w-full h-11 gap-2 bg-amber-400 text-slate-900 hover:bg-amber-300"
              onClick={() => criarCheckout("RECORRENTE")}
              disabled={Boolean(loadingCheckout)}
            >
              {loadingCheckout === "RECORRENTE"
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Crown className="h-4 w-4" />}
              Assinar por {formatMoney(precoRecorrente)}/mês
            </Button>
          </div>
        </div>
      )}

      {/* Pagamento pendente */}
      {!isPremium && checkoutUrl && hasPendingPayment && (
        <div className="rounded-xl border border-amber-500/25 bg-amber-500/8 p-4">
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
        </div>
      )}

      {/* Benefícios */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Ban className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Sem anúncios</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Experiência limpa e sem distrações.</p>
          </div>
        </div>
        <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Validade mensal</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatMoney(precoMensal)} avulso ou {formatMoney(precoRecorrente)} recorrente.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-2xl border border-border bg-card p-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-semibold">Acesso imediato</p>
            <p className="mt-0.5 text-xs text-muted-foreground">Ativado assim que o pagamento é confirmado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
