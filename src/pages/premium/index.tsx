import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { getApiErrorMessage } from "../../api/errors";
import { pagamentosApi } from "../../api/pagamentos/pagamentos-api";
import type { PremiumStatusResponse } from "../../api/pagamentos/types";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const statusLabel = {
  PENDING: "Pendente",
  APPROVED: "Aprovado",
  REJECTED: "Rejeitado",
  CANCELLED: "Cancelado",
  REFUNDED: "Reembolsado",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export function PremiumPage() {
  const [premiumStatus, setPremiumStatus] =
    useState<PremiumStatusResponse | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [loadingCheckout, setLoadingCheckout] = useState(false);
  const [error, setError] = useState("");

  const checkoutUrl = useMemo(() => {
    return premiumStatus?.ultimoPagamento?.checkoutUrl ?? null;
  }, [premiumStatus]);

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
    setLoadingCheckout(true);

    try {
      const data = await pagamentosApi.criarCheckoutPremium();
      const paymentUrl = data.checkoutUrl ?? data.sandboxCheckoutUrl;

      if (!paymentUrl) {
        throw new Error("A API não retornou uma URL de checkout.");
      }

      window.location.href = paymentUrl;
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoadingCheckout(false);
    }
  }

  useEffect(() => {
    void carregarStatus();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-normal text-foreground">
            Plano Premium
          </h1>
          <p className="text-sm text-muted-foreground">
            Consulte seu plano atual e inicie o pagamento pelo Mercado Pago.
          </p>
        </div>

        <Button variant="outline" onClick={carregarStatus} disabled={loadingStatus}>
          <RefreshCw
            className={loadingStatus ? "h-4 w-4 animate-spin" : "h-4 w-4"}
          />
          Atualizar
        </Button>
      </div>

      {error && (
        <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <Card>
          <CardHeader>
            <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <CardTitle>Assinatura Premium</CardTitle>
            <CardDescription>
              Libere recursos premium e remova anúncios do sistema.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div className="flex gap-3 rounded-md border border-border p-3">
                <Ban className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-semibold">Sem anúncios</p>
                  <p className="text-muted-foreground">
                    Ao aprovar o pagamento, a API define `exibirAnuncios: false`.
                  </p>
                </div>
              </div>
              <div className="flex gap-3 rounded-md border border-border p-3">
                <CalendarDays className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                  <p className="font-semibold">Validade mensal</p>
                  <p className="text-muted-foreground">
                    Ainda falta configurar expiração mensal no backend.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Plano atual</p>
                <p className="mt-1 font-semibold">{premiumStatus?.plano ?? "..."}</p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Premium ativo</p>
                <p className="mt-1 font-semibold">
                  {premiumStatus?.premium ? "Sim" : "Não"}
                </p>
              </div>
              <div className="rounded-md border border-border p-3">
                <p className="text-muted-foreground">Anúncios</p>
                <p className="mt-1 font-semibold">
                  {premiumStatus?.exibirAnuncios ? "Ativos" : "Removidos"}
                </p>
              </div>
            </div>

            {premiumStatus?.premium ? (
              <div className="flex items-center gap-2 rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
                <CheckCircle2 className="h-4 w-4" />
                Seu plano Premium já está ativo.
              </div>
            ) : (
              <Button onClick={criarCheckout} disabled={loadingCheckout || loadingStatus}>
                {loadingCheckout ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                Pagar com Mercado Pago
              </Button>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Último pagamento</CardTitle>
            <CardDescription>
              Histórico mais recente retornado pela API.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {loadingStatus && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Carregando status...
              </div>
            )}

            {!loadingStatus && !premiumStatus?.ultimoPagamento && (
              <p className="text-muted-foreground">
                Nenhum pagamento premium encontrado.
              </p>
            )}

            {premiumStatus?.ultimoPagamento && (
              <div className="space-y-3">
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Status</span>
                  <strong>{statusLabel[premiumStatus.ultimoPagamento.status]}</strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Valor</span>
                  <strong>{formatCurrency(premiumStatus.ultimoPagamento.valor)}</strong>
                </div>
                <div className="flex justify-between gap-3">
                  <span className="text-muted-foreground">Criado em</span>
                  <strong>{formatDate(premiumStatus.ultimoPagamento.criadoEm)}</strong>
                </div>
                {checkoutUrl && !premiumStatus.premium && (
                  <Button asChild className="w-full" variant="outline">
                    <a href={checkoutUrl}>Continuar pagamento</a>
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
