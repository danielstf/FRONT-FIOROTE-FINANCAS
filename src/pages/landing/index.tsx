import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CheckCircle2,
  CreditCard,
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
    title: "Controle básico",
    description: "Cadastre receitas, despesas, cartões e vencimentos do mês.",
    icon: WalletCards,
  },
  {
    title: "Relatórios Premium",
    description: "Veja gráficos mensais e anuais para entender melhor seu dinheiro.",
    icon: PieChart,
  },
  {
    title: "Perfis financeiros",
    description: "Separe dados por perfil, como pessoal, família ou empresa.",
    icon: Layers3,
  },
  {
    title: "Recorrências",
    description: "Receitas e despesas fixas ficam disponíveis para usuários Premium.",
    icon: Repeat2,
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-3 px-4 lg:h-24 lg:px-6">
          <BrandLogo mood="positive" size="large" />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            <a className="transition-colors hover:text-foreground" href="#funcoes">
              Funções
            </a>
            <a className="transition-colors hover:text-foreground" href="#precos">
              Planos
            </a>
            <a className="transition-colors hover:text-foreground" href="#app">
              Aplicativo
            </a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <ThemeToggle />
            <Button asChild className="hidden sm:inline-flex" variant="outline">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">
                Começar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-12 px-4 py-10 lg:grid-cols-[minmax(0,1fr)_520px] lg:px-6 lg:py-14">
          <div className="max-w-3xl space-y-7">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <TrendingUp className="h-4 w-4" />
              Gestão financeira simples, visual e segura
            </div>
            <div className="space-y-5">
              <h1 className="text-4xl font-semibold leading-tight tracking-normal text-foreground sm:text-5xl lg:text-6xl">
                Fiorote Control para organizar seu dinheiro todos os meses
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Controle entradas, contas, cartões, perfis financeiros e relatórios
                em uma experiência feita para o navegador e, em breve, também para
                Android na Play Store.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-11 px-5">
                <Link to="/cadastro">
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild className="h-11 px-5" variant="outline">
                <Link to="/login">Acessar minha conta</Link>
              </Button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Plano grátis
              </span>
              <span className="inline-flex items-center gap-2">
                <LockKeyhole className="h-4 w-4 text-primary" />
                Login protegido
              </span>
              <span className="inline-flex items-center gap-2">
                <MonitorSmartphone className="h-4 w-4 text-primary" />
                Web e app em breve
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Perfil Família
                </p>
                <p className="mt-1 text-3xl font-semibold text-emerald-600">
                  R$ 4.820,00
                </p>
              </div>
              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>

            <div className="grid gap-3">
              {[
                ["Receitas", "R$ 7.200,00", "Entradas do mês"],
                ["Despesas", "R$ 2.380,00", "Contas e cartões"],
                ["Saldo", "R$ 4.820,00", "Positivo"],
              ].map(([label, value, detail]) => (
                <div
                  className="rounded-md border border-border bg-background p-3"
                  key={label}
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold">{value}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>

            <div className="mt-5 grid gap-3 rounded-lg border border-border bg-muted/35 p-4 text-sm">
              <div className="flex items-center justify-between">
                <span>Cartão principal</span>
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
              <div className="flex items-center justify-between">
                <span>Receita fixa</span>
                <Repeat2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between">
                <span>Relatório anual</span>
                <PieChart className="h-4 w-4 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-6" id="funcoes">
        <div className="mb-8 max-w-2xl space-y-2">
          <h2 className="text-3xl font-semibold tracking-normal">
            Funções principais
          </h2>
          <p className="text-muted-foreground">
            O essencial fica no plano grátis. Recursos avançados ficam no Premium.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <Card className="shadow-sm" key={feature.title}>
              <CardHeader>
                <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <feature.icon className="h-5 w-5" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-muted/35" id="precos">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
          <div className="max-w-xl space-y-3">
            <p className="text-sm font-semibold uppercase text-primary">Planos</p>
            <h2 className="text-3xl font-semibold tracking-normal">
              Comece grátis e ative o Premium quando precisar
            </h2>
            <p className="text-muted-foreground">
              O Premium custa R$ 5,00 por mês e libera relatórios, perfis
              financeiros, recorrências e remoção de anúncios.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Grátis</CardTitle>
                <CardDescription>Para começar o controle financeiro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-4xl font-semibold">R$ 0</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Receitas, despesas e cartões
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Dashboard mensal
                  </li>
                  <li className="flex gap-2">
                    <BellRing className="mt-0.5 h-4 w-4 text-primary" />
                    Exibição de anúncios
                  </li>
                </ul>
                <Button asChild className="w-full" variant="outline">
                  <Link to="/cadastro">Começar grátis</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-primary/35 shadow-sm">
              <CardHeader>
                <CardTitle>Premium</CardTitle>
                <CardDescription>Para separar perfis e analisar melhor.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-4xl font-semibold">
                  R$ 5,00 <span className="text-sm text-muted-foreground">/mês</span>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Relatórios visuais
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Até 5 perfis financeiros
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Receitas e despesas fixas
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Sem anúncios
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link to="/cadastro">Criar conta</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-card" id="app">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase text-primary">Em breve</p>
            <h2 className="text-3xl font-semibold tracking-normal">
              Fiorote Control também no celular
            </h2>
            <p className="text-muted-foreground">
              Além da versão web, o aplicativo Android será disponibilizado na Play
              Store para consultar e atualizar lançamentos nas duas plataformas.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
              <MonitorSmartphone className="mb-4 h-7 w-7 text-primary" />
              <h3 className="text-xl font-semibold">Use no computador</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Melhor para revisar relatórios, cadastrar dados e acompanhar o mês.
              </p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/10 p-5 shadow-sm">
              <Smartphone className="mb-4 h-7 w-7 text-primary" />
              <h3 className="text-xl font-semibold">App Android</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Em breve na Play Store para uso rápido no dia a dia.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
