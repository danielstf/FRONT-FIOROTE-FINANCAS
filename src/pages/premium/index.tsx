import { useEffect, useState } from "react";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";
import { getApiErrorMessage } from "../../api/errors";
import { pagamentosApi } from "../../api/pagamentos/pagamentos-api";
import type {
  PremiumCheckoutTipo,
  PremiumStatusResponse,
} from "../../api/pagamentos/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../providers/auth-provider";

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function PremiumPage() {
  const { atualizarUsuarioSessao } = useAuth();
  const [premiumStatus, setPremiumStatus] =
    useState<PremiumStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingCheckout, setLoadingCheckout] =
    useState<PremiumCheckoutTipo | null>(null);
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

      if (!paymentUrl) {
        throw new Error("Não foi possível iniciar o pagamento.");
      }

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
      <section className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="grid gap-6 p-5 lg:grid-cols-[minmax(0,1fr)_320px] lg:p-7">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              {isPremium ? "Premium ativo" : "Plano Premium"}
            </div>

            <div className="space-y-3">
              <h1 className="max-w-2xl text-2xl font-semibold tracking-normal text-card-foreground sm:text-3xl lg:text-4xl">
                {isPremium
                  ? isCancelado
                    ? "Seu Premium está cancelado, mas continua válido."
                    : "Sua assinatura Premium está ativa."
                  : "Escolha seu Premium mensal."}
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                O mensal avulso custa {formatMoney(precoMensal)}. O recorrente custa{" "}
                {formatMoney(precoRecorrente)} por mês.
                Ao cancelar, o acesso continua até acabar o período já pago.
              </p>
            </div>

            {error && (
              <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-400">
                {message}
              </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              {isPremium ? (
                <>
                  <div className="inline-flex items-center gap-2 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm font-medium text-emerald-700 dark:text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                    Assinatura ativa
                  </div>
                  {isCancelado ? (
                    <div className="inline-flex items-center gap-2 rounded-md border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-sm font-medium text-amber-700 dark:text-amber-300">
                      <XCircle className="h-4 w-4" />
                      Cancelado no fim do período
                    </div>
                  ) : (
                    <Button
                      onClick={cancelarAssinatura}
                      disabled={loadingCancel || loadingStatus}
                      variant="outline"
                    >
                      {loadingCancel ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      Cancelar Premium
                    </Button>
                  )}
                </>
              ) : (
                <div className="grid w-full max-w-2xl gap-3 sm:grid-cols-2">
                  <div className="rounded-lg border border-border bg-background/70 p-4">
                    <p className="text-sm text-muted-foreground">Mensal avulso</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {formatMoney(precoMensal)}
                    </p>
                    <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                      Pague uma vez e use por 30 dias.
                    </p>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => criarCheckout("MENSAL")}
                      disabled={Boolean(loadingCheckout) || loadingStatus}
                    >
                      {loadingCheckout === "MENSAL" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Comprar por {formatMoney(precoMensal)}
                    </Button>
                  </div>
                  <div className="rounded-lg border border-primary/30 bg-primary/5 p-4">
                    <p className="text-sm text-primary">Recorrente</p>
                    <p className="mt-1 text-2xl font-semibold">
                      {formatMoney(precoRecorrente)}/mês
                    </p>
                    <p className="mt-2 min-h-10 text-sm text-muted-foreground">
                      Cobrança automática mensal, com cancelamento livre.
                    </p>
                    <Button
                      className="mt-4 w-full"
                      onClick={() => criarCheckout("RECORRENTE")}
                      disabled={Boolean(loadingCheckout) || loadingStatus}
                    >
                      {loadingCheckout === "RECORRENTE" ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CreditCard className="h-4 w-4" />
                      )}
                      Assinar por {formatMoney(precoRecorrente)}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {!isPremium && checkoutUrl && hasPendingPayment && (
              <div className="rounded-md border border-amber-500/25 bg-amber-500/10 p-3 text-sm text-amber-700 dark:text-amber-300">
                <p className="font-semibold">Existe um pagamento pendente.</p>
                <p className="mt-1">
                  Você pode continuar esse pagamento ou escolher um dos planos acima para iniciar outro checkout.
                </p>
                <Button asChild className="mt-3">
                  <a href={checkoutUrl}>
                    <CreditCard className="h-4 w-4" />
                    Continuar pagamento pendente
                  </a>
                </Button>
              </div>
            )}
          </div>

          <Card className="self-start border-primary/20 bg-background/80 shadow-sm">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="mt-1 text-xl font-semibold">
                    {isPremium ? "Premium" : "Free"}
                  </p>
                </div>
              </div>

              {loadingStatus ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando plano...
                </div>
              ) : (
                <div className="grid gap-3 text-sm">
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Anúncios</p>
                      <p className="mt-1 font-semibold">
                        {premiumStatus?.exibirAnuncios ? "Ativos" : "Removidos"}
                      </p>
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Validade</p>
                      <p className="mt-1 font-semibold">
                        {premiumStatus?.premiumExpiraEm
                          ? formatDateOnly(premiumStatus.premiumExpiraEm)
                          : "Não ativo"}
                      </p>
                      {isPremium && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {premiumStatus?.premiumDiasRestantes} dias restantes
                        </p>
                      )}
                    </div>
                    <div className="rounded-md border border-border p-3">
                      <p className="text-muted-foreground">Cobrança</p>
                      <p className="mt-1 font-semibold">
                        {isCancelado
                          ? "Cancelada"
                          : isAssinatura
                            ? "Mensal recorrente"
                            : "Mensal avulso"}
                      </p>
                      {premiumStatus?.ultimoPagamento?.assinaturaStatus && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          Status Mercado Pago: {premiumStatus.ultimoPagamento.assinaturaStatus}
                        </p>
                      )}
                    </div>
                  </div>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="flex gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <Ban className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Sem anúncios</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tela mais limpa para usar no dia a dia.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <CalendarDays className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Validade mensal</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {formatMoney(precoMensal)} avulso ou {formatMoney(precoRecorrente)} recorrente.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-lg border border-border bg-card p-4 shadow-sm">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-primary" />
          <div>
            <p className="font-semibold">Acesso imediato</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Assim que a assinatura for confirmada, o plano é ativado.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


