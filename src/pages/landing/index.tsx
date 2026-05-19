import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  Layers3,
  LockKeyhole,
  MonitorSmartphone,
  PieChart,
  Repeat2,
  Smartphone,
  TrendingUp,
  WalletCards,
} from "lucide-react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../../components/brand-logo";
import { ThemeToggle } from "../../components/theme-toggle";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

const features = [
  {
    title: "Controle financeiro",
    description:
      "Cadastre receitas, despesas, cartões, vencimentos e pagamentos.",
    icon: WalletCards,
  },
  {
    title: "Relatórios Premium",
    description:
      "Compare meses, anos, categorias e saldos com gráficos claros.",
    icon: PieChart,
  },
  {
    title: "Exportação Excel",
    description: "Baixe relatórios por mês, ano ou meses selecionados.",
    icon: FileSpreadsheet,
  },
  {
    title: "Perfis financeiros",
    description: "Separe dados por perfil, como pessoal, família ou empresa.",
    icon: Layers3,
  },
  {
    title: "Recorrências",
    description:
      "Controle receitas e despesas fixas com escopo mensal ou futuro.",
    icon: Repeat2,
  },
  {
    title: "Web e Android",
    description: "Use no navegador e no aplicativo Android do Fiorote Control.",
    icon: Smartphone,
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* ── HEADER ── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-3 px-4 lg:h-20 lg:px-8">
          <BrandLogo mood="positive" size="large" />

          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground lg:flex">
            <a
              className="transition-colors hover:text-foreground"
              href="#funcoes"
            >
              Funções
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="#precos"
            >
              Planos
            </a>
            <a
              className="transition-colors hover:text-foreground"
              href="#tutorial"
            >
              Tutorial
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button asChild className="hidden sm:inline-flex" variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">
                Começar grátis
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Subtle grid background */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Soft glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-primary/5 blur-3xl" />

        <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-16 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-8 lg:py-20">
          {/* Left copy */}
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              <TrendingUp className="h-3.5 w-3.5" />
              Gestão financeira simples, visual e segura
            </div>

            <div className="space-y-5">
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl lg:text-[4rem]">
                Organize seu{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">dinheiro</span>
                  <span
                    className="absolute bottom-1 left-0 z-0 h-3 w-full rounded-sm bg-primary/15"
                    aria-hidden
                  />
                </span>{" "}
                todos os meses
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                Controle entradas, contas, cartões, perfis financeiros,
                recorrências e relatórios com exportação em Excel. Funciona na
                web e no app Android.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-11 rounded-lg px-6 text-sm font-semibold"
              >
                <Link to="/cadastro">
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                className="h-11 rounded-lg px-6 text-sm"
                variant="outline"
              >
                <Link to="/login">Acessar minha conta</Link>
              </Button>
            </div>

            <div className="flex flex-wrap gap-5 text-xs font-medium text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-4 w-4 text-emerald-500" />
                Plano grátis disponível
              </span>
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-4 w-4 text-primary" />
                Login protegido
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MonitorSmartphone className="h-4 w-4 text-primary" />
                Web e Android
              </span>
            </div>
          </div>

          {/* Right card / mock dashboard */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-2xl ring-1 ring-border/30">
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Perfil Família
                </p>
                <p className="mt-1.5 text-4xl font-bold text-emerald-500">
                  R$ 4.820,00
                </p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>

            <div className="grid gap-2.5">
              {[
                [
                  "Receitas",
                  "R$ 7.200,00",
                  "Entradas do mês",
                  "text-emerald-500",
                ],
                [
                  "Despesas",
                  "R$ 2.380,00",
                  "Contas e cartões",
                  "text-rose-500",
                ],
                ["Saldo", "R$ 4.820,00", "Positivo", "text-foreground"],
              ].map(([label, value, detail, valueColor]) => (
                <div
                  className="rounded-xl border border-border bg-muted/40 px-4 py-3"
                  key={label}
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-bold ${valueColor}`}>{value}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {detail}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-border bg-background/60 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recursos ativos
              </p>
              <div className="grid gap-2.5 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">
                    Cartão principal
                  </span>
                  <CreditCard className="h-4 w-4 text-primary" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Receita fixa</span>
                  <Repeat2 className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Relatório Excel</span>
                  <FileSpreadsheet className="h-4 w-4 text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section
        className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8"
        id="funcoes"
      >
        <div className="mb-12 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            Funcionalidades
          </p>
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Funções principais
          </h2>
          <p className="max-w-xl text-muted-foreground">
            O essencial fica no plano grátis. Recursos avançados ficam no
            Premium.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => (
            <Card
              className="group relative overflow-hidden border-border/70 shadow-none transition-shadow hover:shadow-md"
              key={feature.title}
            >
              {/* Subtle top accent */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              <CardHeader className="gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    {feature.title}
                  </CardTitle>
                  <CardDescription className="mt-1 text-sm leading-relaxed">
                    {feature.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="border-y border-border bg-muted/30" id="precos">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <div className="mb-12 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Planos
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Comece grátis, evolua quando precisar
            </h2>
            <p className="max-w-xl text-muted-foreground">
              O Premium libera relatórios completos, exportação Excel, perfis
              financeiros, recorrências e remoção de anúncios.
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:max-w-3xl">
            {/* Free plan */}
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="pb-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Grátis
                </p>
                <CardTitle className="text-4xl font-bold">R$ 0</CardTitle>
                <CardDescription>
                  Para começar o controle financeiro.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Receitas, despesas e cartões
                  </li>
                  <li className="flex items-start gap-2.5">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Dashboard mensal
                  </li>
                  <li className="flex items-start gap-2.5 opacity-60">
                    <BellRing className="mt-0.5 h-4 w-4 shrink-0" />
                    Exibição de anúncios
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/cadastro">Começar grátis</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Premium plan */}
            <Card className="relative border-primary/40 shadow-lg">
              <div className="absolute -top-px inset-x-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent" />
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                    Premium
                  </p>
                  <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                    Recomendado
                  </span>
                </div>
                <CardTitle className="text-4xl font-bold">
                  R$ 5,00{" "}
                  <span className="text-base font-normal text-muted-foreground">
                    /mês
                  </span>
                </CardTitle>
                <CardDescription>
                  Para separar perfis e analisar melhor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <ul className="space-y-2.5 text-sm text-muted-foreground">
                  {[
                    "Relatórios visuais",
                    "Exportação Excel",
                    "Até 5 perfis financeiros",
                    "Receitas e despesas fixas",
                    "Sem anúncios",
                  ].map((item) => (
                    <li className="flex items-start gap-2.5" key={item}>
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      {item}
                    </li>
                  ))}
                </ul>
                <Button asChild className="w-full">
                  <Link to="/cadastro">Criar conta</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── TUTORIAL ── */}
      <section className="border-b border-border" id="tutorial">
        <div className="mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <div className="mb-12 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Tutorial
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Aprenda o fluxo em poucos passos
            </h2>
            <p className="max-w-xl text-muted-foreground">
              O tutorial em vídeo pode ser publicado aqui quando o arquivo
              estiver pronto. Por enquanto, a página já mostra o roteiro de uso
              do sistema.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["1", "Cadastre receitas e despesas"],
              ["2", "Separe perfis financeiros"],
              ["3", "Acompanhe o dashboard mensal"],
              ["4", "Exporte relatórios em Excel"],
            ].map(([step, title]) => (
              <div
                className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                key={step}
              >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-base font-bold text-primary">
                  {step}
                </span>
                <h3 className="mt-5 text-sm font-semibold leading-snug">
                  {title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
