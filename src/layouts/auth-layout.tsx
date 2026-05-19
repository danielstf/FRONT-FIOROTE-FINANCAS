import { BarChart3, ShieldCheck, Sparkles, WalletCards } from "lucide-react";
import { Outlet } from "react-router-dom";
import { BrandLogo } from "../components/brand-logo";

const highlights = [
  {
    icon: WalletCards,
    label: "Fluxo",
    value: "Receitas e despesas no mesmo pulso",
  },
  {
    icon: BarChart3,
    label: "Clareza",
    value: "Leitura rápida do mês financeiro",
  },
  {
    icon: ShieldCheck,
    label: "Conta",
    value: "Acesso protegido para seus dados",
  },
];

export function AuthLayout() {
  return (
    <main className="dark min-h-screen overflow-hidden bg-[#050816] text-foreground">
      <section className="relative isolate grid min-h-screen w-full items-stretch lg:grid-cols-[minmax(0,1.08fr)_minmax(420px,0.72fr)]">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_20%_12%,rgba(59,130,246,0.24),transparent_30rem),radial-gradient(circle_at_84%_82%,rgba(20,184,166,0.18),transparent_28rem),linear-gradient(135deg,#050816_0%,#0b1224_48%,#03141f_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.16] [background-image:linear-gradient(rgba(255,255,255,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.5)_1px,transparent_1px)] [background-size:52px_52px]" />

        <div className="relative hidden min-h-screen flex-col justify-between px-10 py-8 lg:flex xl:px-14">
          <BrandLogo mood="negative" size="nav" />

          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/7 px-3 py-2 text-sm font-medium text-sky-100 shadow-2xl shadow-black/20 backdrop-blur">
              <Sparkles className="h-4 w-4 text-cyan-300" />
              Área financeira Fiorote Control
            </div>

            <div className="space-y-5">
              <h1 className="max-w-3xl text-5xl font-semibold leading-[1.04] tracking-normal text-white xl:text-6xl">
                Seu painel financeiro começa com um acesso mais elegante.
              </h1>
              <p className="max-w-xl text-lg leading-8 text-slate-300">
                Entre para acompanhar entradas, saídas, cartões e recursos Premium em um ambiente direto,
                visual e pronto para decisões rápidas.
              </p>
            </div>

            <div className="relative h-64 max-w-xl overflow-hidden rounded-lg border border-white/10 bg-white/7 p-5 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="absolute right-5 top-5 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                Em dia
              </div>
              <div className="space-y-2">
                <p className="text-sm text-slate-400">Saldo projetado</p>
                <p className="text-4xl font-semibold text-white">R$ 8.420,00</p>
              </div>
              <div className="mt-8 grid h-28 grid-cols-7 items-end gap-3">
                {[38, 58, 46, 78, 62, 90, 72].map((height, index) => (
                  <div
                    className="rounded-t-md bg-gradient-to-t from-blue-500 to-cyan-300 shadow-lg shadow-blue-950/30"
                    key={index}
                    style={{ height: `${height}%` }}
                  />
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-xs text-slate-300">
                <span>Receitas</span>
                <span>Despesas</span>
                <span>Premium</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {highlights.map((item) => (
              <div className="rounded-lg border border-white/10 bg-white/7 p-4 backdrop-blur" key={item.label}>
                <item.icon className="mb-3 h-5 w-5 text-cyan-300" />
                <p className="text-sm font-semibold text-white">{item.label}</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="flex min-h-screen items-center justify-center px-5 py-7 sm:px-8 lg:bg-black/12 lg:px-10 lg:backdrop-blur-sm">
          <div className="w-full max-w-[460px] space-y-6">
            <div className="flex justify-center lg:hidden">
              <BrandLogo mood="negative" size="nav" />
            </div>
            <Outlet />
          </div>
        </div>
      </section>
    </main>
  );
}
