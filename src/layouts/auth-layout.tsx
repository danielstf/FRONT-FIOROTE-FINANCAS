import { motion } from "motion/react";
import { ArrowUpRight, BadgeCheck, BarChart3, LockKeyhole, WalletCards } from "lucide-react";
import { Outlet } from "react-router-dom";
import { BrandLogo } from "../components/brand-logo";

const metrics = [
  { label: "Receitas", value: "R$ 7.200", tone: "text-emerald-300" },
  { label: "Despesas", value: "R$ 2.380", tone: "text-rose-300" },
  { label: "Saldo", value: "R$ 4.820", tone: "text-cyan-200" },
];

const signals = [
  { icon: WalletCards, label: "Fluxo mensal" },
  { icon: BarChart3, label: "Relatórios VIP" },
  { icon: LockKeyhole, label: "Acesso protegido" },
];

export function AuthLayout() {
  return (
    <main className="dark min-h-screen overflow-hidden bg-[#050914] text-foreground">
      <section className="relative isolate min-h-screen">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_14%_14%,rgba(34,211,238,0.18),transparent_28rem),radial-gradient(circle_at_78%_18%,rgba(59,130,246,0.22),transparent_32rem),linear-gradient(135deg,#050914_0%,#08111f_48%,#020617_100%)]" />
        <div className="pointer-events-none absolute inset-0 -z-10 opacity-[0.1] [background-image:linear-gradient(rgba(255,255,255,0.65)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.65)_1px,transparent_1px)] [background-size:44px_44px]" />

        <div className="mx-auto grid min-h-screen w-full max-w-7xl gap-8 px-5 py-6 sm:px-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:items-center lg:px-10 xl:gap-16">
          <motion.div
            className="hidden min-h-[calc(100vh-3rem)] flex-col justify-between lg:flex"
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <BrandLogo size="nav" />

            <div className="max-w-2xl space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-cyan-200">
                <BadgeCheck className="h-3.5 w-3.5" />
                Painel financeiro privado
              </div>

              <div className="space-y-5">
                <h1 className="max-w-3xl text-5xl font-semibold leading-[1.03] tracking-normal text-white xl:text-6xl">
                  Controle seu dinheiro com uma visão limpa do mês.
                </h1>
                <p className="max-w-xl text-lg leading-8 text-slate-300">
                  Acesse sua área para acompanhar receitas, despesas, cartões, perfis e relatórios em um ambiente direto.
                </p>
              </div>

              <div className="grid max-w-2xl gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <div className="rounded-2xl border border-white/10 bg-white/[0.07] p-5 shadow-2xl shadow-black/25 backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Saldo projetado</p>
                      <p className="mt-2 text-4xl font-semibold text-white">R$ 4.820,00</p>
                    </div>
                    <div className="inline-flex items-center gap-1 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-semibold text-emerald-200">
                      <ArrowUpRight className="h-3.5 w-3.5" />
                      12%
                    </div>
                  </div>

                  <div className="mt-7 grid h-28 grid-cols-7 items-end gap-2">
                    {[34, 56, 46, 72, 64, 88, 76].map((height, index) => (
                      <div className="rounded-t bg-gradient-to-t from-blue-600 to-cyan-300" key={index} style={{ height: `${height}%` }} />
                    ))}
                  </div>

                  <div className="mt-5 grid gap-2">
                    {metrics.map((item) => (
                      <div className="flex items-center justify-between rounded-lg bg-slate-950/45 px-3 py-2 text-sm" key={item.label}>
                        <span className="text-slate-400">{item.label}</span>
                        <span className={`font-semibold ${item.tone}`}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid content-between gap-3">
                  {signals.map((item) => (
                    <div className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur" key={item.label}>
                      <item.icon className="mb-4 h-5 w-5 text-cyan-300" />
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <p className="max-w-md text-xs leading-5 text-slate-500">
              Fiorote Controle Financeiro combina cadastro financeiro, controle de recorrências e recursos VIP para análise mensal.
            </p>
          </motion.div>

          <motion.div
            className="flex min-h-[calc(100vh-3rem)] items-center justify-center lg:justify-end"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="w-full max-w-[440px]">
              <div className="mb-7 flex justify-center lg:hidden">
                <BrandLogo size="nav" />
              </div>
              <Outlet />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}

