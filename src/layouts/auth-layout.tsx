import { motion } from "motion/react";
import { ArrowUpRight, BadgeCheck, BarChart3, LockKeyhole, WalletCards } from "lucide-react";
import { Outlet } from "react-router-dom";
import { BrandLogo } from "../components/brand-logo";

const bars = [34, 52, 44, 68, 60, 84, 72];

const metrics = [
  { label: "Receitas", value: "R$ 7.200", color: "text-emerald-400" },
  { label: "Despesas", value: "R$ 2.380", color: "text-rose-400" },
  { label: "Saldo", value: "R$ 4.820", color: "text-cyan-300" },
];

const signals = [
  { icon: WalletCards, label: "Fluxo mensal", desc: "Receitas e despesas por mês" },
  { icon: BarChart3, label: "Relatórios VIP", desc: "Gráficos e exportação Excel" },
  { icon: LockKeyhole, label: "Acesso protegido", desc: "Login seguro por e-mail ou Google" },
];

export function AuthLayout() {
  return (
    <main className="dark min-h-screen overflow-hidden bg-[#040c18] text-foreground">
      {/* ── Fundo principal ─────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 10% 0%, rgba(34,211,238,0.13) 0%, transparent 55%), radial-gradient(ellipse 60% 50% at 85% 5%, rgba(59,130,246,0.18) 0%, transparent 50%), linear-gradient(180deg,#040c18 0%,#060f1c 100%)",
        }}
      />
      {/* Grid de linhas */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.07]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.7) 1px, transparent 1px)",
          backgroundSize: "44px 44px",
        }}
      />
      {/* Linhas diagonais sutis */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 opacity-[0.03]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 30px)",
        }}
      />

      {/* ── Blobs animados globais ──────────────────────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Blob ciano — superior esquerdo */}
        <div
          className="absolute -left-32 -top-32 h-[480px] w-[480px] rounded-full blur-3xl animate-float-slow"
          style={{ background: "rgba(34,211,238,0.07)", animationDelay: "-2s" }}
        />
        {/* Blob azul — inferior direito */}
        <div
          className="absolute -bottom-40 -right-40 h-[520px] w-[520px] rounded-full blur-3xl animate-drift"
          style={{ background: "rgba(59,130,246,0.08)", animationDelay: "-6s" }}
        />
        {/* Blob violeta — centro */}
        <div
          className="absolute left-1/2 top-1/2 h-[280px] w-[280px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl animate-float"
          style={{ background: "rgba(99,102,241,0.05)", animationDelay: "-1s" }}
        />
        {/* Glow ciano extra — superior direito */}
        <div
          className="absolute -right-16 top-16 h-64 w-64 rounded-full blur-3xl animate-float-slow"
          style={{ background: "rgba(34,211,238,0.05)", animationDelay: "-4s" }}
        />
      </div>

      {/* ── Dot grid — canto inferior esquerdo ─────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none fixed bottom-0 left-0 h-48 w-48 opacity-[0.06] -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }}
      />
      {/* Dot grid — canto superior direito */}
      <div
        aria-hidden
        className="pointer-events-none fixed right-0 top-0 h-56 w-56 opacity-[0.05] -z-10"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.9) 1.5px, transparent 1.5px)",
          backgroundSize: "14px 14px",
        }}
      />

      <div className="mx-auto grid min-h-screen w-full max-w-7xl px-5 py-6 sm:px-8 lg:grid-cols-[1fr_440px] lg:items-center lg:gap-12 lg:px-10 xl:gap-20">
        {/* ── Left panel ──────────────────────────────────────────── */}
        <motion.div
          className="hidden min-h-[calc(100vh-3rem)] flex-col justify-between gap-10 lg:flex"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
        >
          <BrandLogo size="nav" />

          <div className="space-y-10">
            {/* Headline */}
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/8 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-cyan-300">
                <BadgeCheck className="h-3.5 w-3.5" />
                Painel financeiro privado
              </div>
              <h1 className="max-w-lg text-[2.6rem] font-semibold leading-[1.07] tracking-tight text-white">
                Controle seu dinheiro com clareza total.
              </h1>
              <p className="max-w-sm text-base leading-relaxed text-slate-400">
                Receitas, despesas, cartões e relatórios reunidos em um único painel limpo e rápido.
              </p>
            </div>

            {/* Dashboard mock */}
            <div className="relative grid max-w-xl gap-3 sm:grid-cols-[1.2fr_0.8fr]">
              {/* Anel decorativo atrás dos cards */}
              <div
                aria-hidden
                className="pointer-events-none absolute -left-10 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-cyan-400/8"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full border border-cyan-400/5"
              />

              {/* Chart card */}
              <div className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.05] p-5 backdrop-blur-xl">
                {/* Linha decorativa no topo */}
                <div
                  aria-hidden
                  className="absolute inset-x-6 -top-px h-0.5 rounded-full"
                  style={{ background: "linear-gradient(90deg, transparent, rgba(34,211,238,0.6), transparent)" }}
                />
                {/* Glow interno sutil */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/4 via-transparent to-transparent"
                />

                <div className="relative flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Saldo projetado</p>
                    <p className="mt-1.5 text-3xl font-semibold text-white">R$ 4.820</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-300">
                    <ArrowUpRight className="h-3 w-3" />
                    +12%
                  </span>
                </div>

                {/* Bars */}
                <div className="relative mt-6 flex h-20 items-end gap-1.5">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        background: "linear-gradient(to top, #2563eb, #22d3ee)",
                        opacity: i === bars.length - 1 ? 1 : 0.5 + i * 0.07,
                      }}
                    />
                  ))}
                </div>

                {/* Metrics */}
                <div className="relative mt-4 space-y-1.5">
                  {metrics.map((m) => (
                    <div
                      key={m.label}
                      className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2 text-sm"
                    >
                      <span className="text-slate-400">{m.label}</span>
                      <span className={`font-semibold ${m.color}`}>{m.value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Signal cards */}
              <div className="flex flex-col gap-2.5">
                {signals.map((s, i) => (
                  <div
                    key={s.label}
                    className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-2xl border border-white/8 bg-white/[0.04] p-4 backdrop-blur"
                  >
                    {/* Glow no hover */}
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                    />
                    <s.icon className={`relative h-4.5 w-4.5 ${i === 0 ? "text-cyan-300" : i === 1 ? "text-blue-400" : "text-emerald-400"}`} />
                    <div className="relative">
                      <p className="text-sm font-semibold text-white">{s.label}</p>
                      <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <p className="text-xs leading-relaxed text-slate-600">
            Fiorote Controle Financeiro — cadastro financeiro, recorrências e relatórios VIP mensais.
          </p>
        </motion.div>

        {/* ── Right panel (form) ───────────────────────────────────── */}
        <motion.div
          className="flex min-h-[calc(100vh-3rem)] items-center justify-center lg:justify-end"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="w-full max-w-[420px]">
            <div className="mb-8 flex justify-center lg:hidden">
              <BrandLogo size="nav" />
            </div>
            <Outlet />
          </div>
        </motion.div>
      </div>
    </main>
  );
}
