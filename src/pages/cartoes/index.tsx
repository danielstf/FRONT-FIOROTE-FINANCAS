import {
  CreditCard,
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  WalletCards,
  X,
} from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { cartoesApi } from "../../api/cartoes/cartoes-api";
import type { CartaoCredito } from "../../api/cartoes/types";
import { getApiErrorMessage } from "../../api/errors";
import { EmptyState } from "../../components/empty-state";
import { PageHeader } from "../../components/page-header";
import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../components/ui/dialog";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { CARD_GRADIENTS, getCardGradient } from "../../lib/card-colors";
import { pageVariants, sectionVariants } from "../../lib/motion";
import { normalizeRequiredText, toUppercaseText } from "../../lib/text";
import { useAuth } from "../../providers/auth-provider";

const COLORS_KEY = "fiorote-card-colors";

function loadColors(): Record<string, number> {
  try {
    const s = localStorage.getItem(COLORS_KEY);
    return s ? (JSON.parse(s) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function persistColor(cardId: string, index: number) {
  try {
    localStorage.setItem(COLORS_KEY, JSON.stringify({ ...loadColors(), [cardId]: index }));
  } catch {}
}

function CardPreview({ nome, colorIndex }: { nome: string; colorIndex: number }) {
  const g = getCardGradient(colorIndex);
  const label = nome.trim() || "NOME DO CARTÃO";

  return (
    <div
      className="relative w-full aspect-[1.586/1] rounded-2xl overflow-hidden text-white shadow-lg select-none"
      style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
    >
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/30" />
      <div aria-hidden className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
      <div aria-hidden className="pointer-events-none absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-white/8" />

      {/* Chip EMV */}
      <div className="absolute left-4 top-4 h-6 w-9 overflow-hidden rounded-sm bg-amber-300/90 shadow-sm">
        <div className="absolute inset-x-0 top-[33%] h-px bg-amber-700/40" />
        <div className="absolute inset-x-0 top-[66%] h-px bg-amber-700/40" />
        <div className="absolute inset-y-0 left-[42%] w-px bg-amber-700/30" />
      </div>

      <div className="absolute right-4 top-4 opacity-20">
        <CreditCard className="h-6 w-6" />
      </div>

      {/* Número fictício */}
      <div className="absolute left-4 right-4 top-[46%] flex items-center gap-2">
        {[0, 1, 2, 3].map((g) => (
          <div key={g} className="flex gap-0.5">
            {[0, 1, 2, 3].map((d) => (
              <span key={d} className="block h-1.5 w-1.5 rounded-full bg-white/50" />
            ))}
          </div>
        ))}
      </div>

      <div className="absolute bottom-4 left-4 right-4">
        <p className={`truncate text-sm font-bold tracking-widest ${!nome.trim() ? "opacity-35" : ""}`}>
          {label}
        </p>
        <p className="mt-0.5 text-[10px] font-medium opacity-50 uppercase tracking-wider">
          Cartão de crédito
        </p>
      </div>
    </div>
  );
}

export function CartoesPage() {
  const { perfilFinanceiroId } = useAuth();
  const [cartoes, setCartoes] = useState<CartaoCredito[]>([]);
  const [nome, setNome] = useState("");
  const [selectedColor, setSelectedColor] = useState(0);
  const [cardColors, setCardColors] = useState<Record<string, number>>({});
  const [editando, setEditando] = useState<CartaoCredito | null>(null);
  const [excluindo, setExcluindo] = useState<CartaoCredito | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    setCardColors(loadColors());
  }, []);

  async function carregarCartoes() {
    setError("");
    setLoading(true);
    try {
      const data = await cartoesApi.listar();
      setCartoes(data.cartoes.map((c) => ({ ...c, nome: toUppercaseText(c.nome) })));
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  async function salvarCartao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSaving(true);
    try {
      const nomeNormalizado = normalizeRequiredText(nome);
      if (!nomeNormalizado) { toast.error("Informe o nome do cartão."); return; }
      if (editando) {
        await cartoesApi.editar(editando.id, { nome: nomeNormalizado });
        persistColor(editando.id, selectedColor);
        setCardColors((prev) => ({ ...prev, [editando.id]: selectedColor }));
        toast.success("Cartão atualizado com sucesso.");
      } else {
        const created = await cartoesApi.criar({ nome: nomeNormalizado });
        persistColor(created.id, selectedColor);
        setCardColors((prev) => ({ ...prev, [created.id]: selectedColor }));
        toast.success("Cartão cadastrado com sucesso.");
      }
      setNome("");
      setSelectedColor(0);
      setEditando(null);
      await carregarCartoes();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  async function confirmarExclusao() {
    if (!excluindo) return;
    setError("");
    setBusyId(excluindo.id);
    try {
      await cartoesApi.excluir(excluindo.id);
      toast.success("Cartão excluído com sucesso.");
      setExcluindo(null);
      await carregarCartoes();
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setBusyId(null);
    }
  }

  function iniciarEdicao(cartao: CartaoCredito) {
    setEditando(cartao);
    setNome(toUppercaseText(cartao.nome));
    setSelectedColor(cardColors[cartao.id] ?? 0);
    setError("");
  }

  function cancelarEdicao() {
    setEditando(null);
    setNome("");
    setSelectedColor(0);
  }

  useEffect(() => {
    void carregarCartoes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfilFinanceiroId]);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-5"
    >
      <motion.div variants={sectionVariants}>
        <PageHeader
          icon={WalletCards}
          title="Cartões de crédito"
          subtitle="Cadastre para vincular em despesas"
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

      <motion.div variants={sectionVariants} className="grid gap-5 lg:grid-cols-[380px_1fr]">
        {/* ── Formulário ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              {editando ? <Pencil className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </div>
            <p className="text-sm font-semibold">{editando ? "Editar cartão" : "Novo cartão"}</p>
          </div>

          <div className="p-5 space-y-5">
            {/* Preview ao vivo */}
            <CardPreview nome={nome} colorIndex={selectedColor} />

            <form className="grid gap-4" onSubmit={salvarCartao}>
              <div className="space-y-2">
                <Label htmlFor="nome-cartao" className="text-xs font-medium text-muted-foreground">
                  Nome do cartão
                </Label>
                <Input
                  id="nome-cartao"
                  value={nome}
                  onChange={(e) => setNome(toUppercaseText(e.target.value))}
                  placeholder="Ex: NUBANK, INTER, ITAÚ"
                  required
                  className="h-10"
                />
              </div>

              {/* Seletor de cor */}
              <div className="space-y-2">
                <Label className="text-xs font-medium text-muted-foreground">Cor</Label>
                <div className="flex gap-2 flex-wrap">
                  {CARD_GRADIENTS.map((gradient, i) => (
                    <button
                      key={i}
                      type="button"
                      title={gradient.label}
                      aria-label={gradient.label}
                      aria-pressed={selectedColor === i}
                      onClick={() => setSelectedColor(i)}
                      className="h-7 w-7 rounded-full transition-all duration-150 hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      style={{
                        background: `linear-gradient(135deg, ${gradient.from}, ${gradient.to})`,
                        boxShadow:
                          selectedColor === i
                            ? `0 0 0 2px var(--background), 0 0 0 4px ${gradient.from}`
                            : undefined,
                        transform: selectedColor === i ? "scale(1.18)" : undefined,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={saving} className="h-10 flex-1 gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {editando ? "Salvar" : "Cadastrar"}
                </Button>
                {editando && (
                  <Button type="button" variant="outline" onClick={cancelarEdicao} className="h-10 gap-2">
                    <X className="h-4 w-4" />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* ── Lista ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <CreditCard className="h-3.5 w-3.5" />
              </div>
              <p className="text-sm font-semibold">Cartões cadastrados</p>
            </div>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-muted-foreground">
              {cartoes.length}
            </span>
          </div>

          {loading && (
            <div className="flex items-center gap-2.5 p-5 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          )}

          {!loading && cartoes.length === 0 && (
            <EmptyState
              icon={CreditCard}
              title="Nenhum cartão cadastrado."
              description="Cadastre seu primeiro cartão para usar em despesas."
            />
          )}

          {!loading && cartoes.length > 0 && (
            <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 xl:grid-cols-4">
              {cartoes.map((cartao, index) => {
                const ci = cardColors[cartao.id] ?? index;
                const g = getCardGradient(ci);
                return (
                  <div
                    key={cartao.id}
                    className="group relative aspect-[1.586/1] overflow-hidden rounded-xl text-white shadow-md"
                    style={{ background: `linear-gradient(135deg, ${g.from}, ${g.to})` }}
                  >
                    <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-white/30" />
                    <div aria-hidden className="pointer-events-none absolute -right-4 -top-4 h-20 w-20 rounded-full bg-white/10" />
                    <div aria-hidden className="pointer-events-none absolute -bottom-6 -left-6 h-20 w-20 rounded-full bg-white/8" />

                    {/* Chip EMV */}
                    <div className="absolute left-3 top-3 h-5 w-7 overflow-hidden rounded-sm bg-amber-300/90 shadow-sm">
                      <div className="absolute inset-x-0 top-[33%] h-px bg-amber-700/40" />
                      <div className="absolute inset-x-0 top-[66%] h-px bg-amber-700/40" />
                      <div className="absolute inset-y-0 left-[42%] w-px bg-amber-700/30" />
                    </div>

                    <div className="absolute right-3 top-3 opacity-20">
                      <CreditCard className="h-5 w-5" />
                    </div>

                    {/* Ações hover */}
                    <div className="absolute right-2 top-2 flex gap-1 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                      <button
                        aria-label="Editar cartão"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20 text-white transition-colors hover:bg-white/35"
                        type="button"
                        onClick={() => iniciarEdicao(cartao)}
                      >
                        <Pencil className="h-2.5 w-2.5" />
                      </button>
                      <button
                        aria-label="Excluir cartão"
                        className="flex h-6 w-6 items-center justify-center rounded-md bg-white/20 text-white transition-colors hover:bg-red-500/70 disabled:opacity-50"
                        type="button"
                        disabled={busyId === cartao.id}
                        onClick={() => setExcluindo(cartao)}
                      >
                        {busyId === cartao.id
                          ? <Loader2 className="h-2.5 w-2.5 animate-spin" />
                          : <Trash2 className="h-2.5 w-2.5" />}
                      </button>
                    </div>

                    {/* Pontos do número */}
                    <div className="absolute left-3 right-3 top-[44%] flex items-center gap-1.5">
                      {[0, 1, 2, 3].map((group) => (
                        <div key={group} className="flex gap-0.5">
                          {[0, 1, 2, 3].map((dot) => (
                            <span key={dot} className="block h-1 w-1 rounded-full bg-white/55" />
                          ))}
                        </div>
                      ))}
                    </div>

                    <div className="absolute bottom-3 left-3 right-3">
                      <p className="truncate text-[11px] font-bold tracking-widest">{cartao.nome}</p>
                      <p className="mt-0.5 text-[9px] font-medium opacity-55">
                        desde {new Date(cartao.criadoEm).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>

      {/* ── Dialog: exclusão ── */}
      <Dialog open={Boolean(excluindo)} onOpenChange={(open) => { if (!open) setExcluindo(null); }}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir cartão</DialogTitle>
            <DialogDescription>
              O cartão será desativado e não aparecerá mais nas listagens. Todas as despesas vinculadas a ele permanecem preservadas no histórico.
            </DialogDescription>
          </DialogHeader>
          <div className="rounded-xl border border-border bg-muted/30 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{excluindo?.nome}</p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => setExcluindo(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={busyId === excluindo?.id}
              onClick={confirmarExclusao}
            >
              {busyId === excluindo?.id && <Loader2 className="h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}
