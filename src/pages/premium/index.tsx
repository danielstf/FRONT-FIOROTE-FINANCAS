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
import type { PremiumStatusResponse } from "../../api/pagamentos/types";
import { Button } from "../../components/ui/button";
import { Card, CardContent } from "../../components/ui/card";
import { useAuth } from "../../providers/auth-provider";

function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "medium",
  }).format(new Date(value));
}

export function PremiumPage() {
  const { atualizarUsuarioSessao } = useAuth();
  const [premiumStatus, setPremiumStatus] =
    useState<PremiumStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const isPremium = Boolean(premiumStatus?.premium);
  const checkoutUrl = premiumStatus?.ultimoPagamento?.checkoutUrl ?? null;
  const hasPendingPayment = premiumStatus?.ultimoPagamento?.status === "PENDING";
  const isAssinatura = premiumStatus?.ultimoPagamento?.tipo === "ASSINATURA";

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

  async function criarCheckout() {
    setError("");
    setMessage("");
    setLoadingCheckout(true);

    try {
      const data = await pagamentosApi.criarCheckoutPremium();
      const paymentUrl = data.checkoutUrl ?? data.sandboxCheckoutUrl;

      if (!paymentUrl) {
        throw new Error("Não foi possível iniciar o pagamento.");
      }

      window.location.href = paymentUrl;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingCheckout(false);
    }
  }

  async function cancelarAssinatura() {
    const confirmed = window.confirm(
      "Cancelar sua assinatura Premium? O acesso aos recursos Premium será removido.",
    );

    if (!confirmed) return;

    setError("");
    setMessage("");
    setLoadingCancel(true);

    try {
      const data = await pagamentosApi.cancelarPremium();
      atualizarUsuarioSessao(data.usuario);
      setMessage("Assinatura cancelada com sucesso.");
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
                  ? "Sua assinatura Premium está ativa."
                  : "Assine o Premium mensal e cancele quando quiser."}
              </h1>
              <p className="max-w-xl text-sm text-muted-foreground">
                O Premium remove anúncios, libera relatórios e mantém sua área financeira mais limpa.
                A cobrança é mensal e recorrente pelo Mercado Pago.
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
                    Cancelar assinatura
                  </Button>
                </>
              ) : checkoutUrl && hasPendingPayment ? (
                <Button asChild>
                  <a href={checkoutUrl}>
                    <CreditCard className="h-4 w-4" />
                    Continuar assinatura
                  </a>
                </Button>
              ) : (
                <Button onClick={criarCheckout} disabled={loadingCheckout || loadingStatus}>
                  {loadingCheckout ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CreditCard className="h-4 w-4" />
                  )}
                  Assinar Premium
                </Button>
              )}
            </div>
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
                        {isAssinatura ? "Mensal recorrente" : "Mensal"}
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
              Cobrança automática uma vez por mês.
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


