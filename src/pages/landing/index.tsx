import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  LockKeyhole,
  MonitorSmartphone,
  PieChart,
  Smartphone,
  ReceiptText,
  ShieldCheck,
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
    title: "Receitas e despesas",
    description:
      "Cadastre entradas, contas, parcelas, vencimentos e despesas fixas em poucos passos.",
    icon: WalletCards,
  },
  {
    title: "Dashboard mensal",
    description:
      "Acompanhe saldo, pendências, contas vencidas e movimentações do mês.",
    icon: BarChart3,
  },
  {
    title: "Relatórios visuais",
    description:
      "Analise gráficos de área, pizza e comparativos mensais ou anuais.",
    icon: PieChart,
  },
  {
    title: "Cartões organizados",
    description:
      "Controle gastos no crédito por cartão e mantenha as faturas sob controle.",
    icon: CreditCard,
  },
];

const highlights = [
  { label: "Receitas", value: "R$ 7.200,00", detail: "+12% no mês", color: "bg-emerald-500" },
  { label: "Despesas", value: "R$ 2.380,00", detail: "38% do previsto", color: "bg-rose-500" },
  { label: "Saldo", value: "R$ 4.820,00", detail: "Disponível", color: "bg-blue-500" },
];

const movements = [
  ["Aluguel", "Vence hoje", "R$ 1.250,00"],
  ["Salário", "Recebido", "R$ 5.800,00"],
  ["Cartão principal", "Próxima fatura", "R$ 890,00"],
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex h-20 w-full max-w-7xl items-center justify-between gap-3 px-4 lg:h-24 lg:px-6">
          <BrandLogo size="large" />
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex">
            <a className="transition-colors hover:text-foreground" href="#funcoes">
              Funções
            </a>
            <a className="transition-colors hover:text-foreground" href="#precos">
              Preços
            </a>
            <a className="transition-colors hover:text-foreground" href="#seguranca">
              Segurança
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
                Controle seu dinheiro com clareza todos os meses
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                O Fiorote Control organiza receitas, despesas, cartões, vencimentos
                e relatórios em uma experiência feita para acompanhar sua rotina
                financeira pelo navegador e, em breve, também pelo aplicativo para
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
                Plano gratuito
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Dados protegidos
              </span>
              <span className="inline-flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                Web e aplicativo
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-5 shadow-xl">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  Resumo de maio
                </p>
                <p className="mt-1 text-3xl font-semibold text-foreground">
                  R$ 4.820,00
                </p>
              </div>
              <div className="rounded-md bg-primary/10 p-3 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>

            <div className="grid gap-3">
              {highlights.map((item) => (
                <div
                  className="rounded-md border border-border bg-background p-3"
                  key={item.label}
                >
                  <div className="mb-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{item.label}</span>
                    <span className="font-semibold">{item.value}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="h-2 flex-1 rounded-full bg-muted">
                      <div className={`h-2 w-2/3 rounded-full ${item.color}`} />
                    </div>
                    <span className="text-xs text-muted-foreground">{item.detail}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 space-y-3 rounded-lg border border-border bg-muted/35 p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">Próximas movimentações</p>
                <CalendarClock className="h-4 w-4 text-primary" />
              </div>
              {movements.map(([label, status, value]) => (
                <div
                  className="flex items-center justify-between gap-3 text-sm"
                  key={label}
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-foreground">{label}</p>
                    <p className="truncate text-xs text-muted-foreground">{status}</p>
                  </div>
                  <span className="shrink-0 font-semibold">{value}</span>
                </div>
              ))}
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
            Tudo o que você precisa para fechar o mês, acompanhar atrasos e tomar
            decisões financeiras melhores.
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

      <section className="border-y border-border bg-card">
        <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-14 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:px-6">
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase text-primary">
              Em breve
            </p>
            <h2 className="text-3xl font-semibold tracking-normal">
              Acompanhe suas finanças também pelo celular
            </h2>
            <p className="text-muted-foreground">
              Além da versão web, o Fiorote Control terá aplicativo Android
              disponível na Play Store para você consultar e atualizar seus
              lançamentos onde estiver.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border border-border bg-background p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
                <MonitorSmartphone className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">Use no computador</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Acesse pelo navegador para cadastrar, revisar relatórios e
                acompanhar o mês com mais espaço na tela.
              </p>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/10 p-5 shadow-sm">
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-md bg-background text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
              <h3 className="text-xl font-semibold">App Android em breve</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                O aplicativo será disponibilizado na Play Store para facilitar o
                controle financeiro no dia a dia.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-border bg-muted/35" id="precos">
        <div className="mx-auto grid w-full max-w-7xl gap-5 px-4 py-16 lg:grid-cols-[0.9fr_1.1fr] lg:px-6">
          <div className="max-w-xl space-y-3">
            <p className="text-sm font-semibold uppercase text-primary">
              Planos
            </p>
            <h2 className="text-3xl font-semibold tracking-normal">
              Comece gratuitamente e evolua quando fizer sentido
            </h2>
            <p className="text-muted-foreground">
              A versão gratuita cobre o controle essencial. O Premium remove os
              anúncios e mantém a experiência mais limpa por apenas R$ 5,00 ao mês.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Gratuito</CardTitle>
                <CardDescription>Para iniciar seu controle financeiro.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-4xl font-semibold">R$ 0</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Receitas e despesas
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Relatórios mensais e anuais
                  </li>
                  <li className="flex gap-2">
                    <BellRing className="mt-0.5 h-4 w-4 text-primary" />
                    Anúncios do sistema
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
                <CardDescription>Mais foco, sem anúncios.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-4xl font-semibold">
                  R$ 5,00{" "}
                  <span className="text-sm text-muted-foreground">/mês</span>
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Sem anúncios
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Experiência mais limpa
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                    Mesmo painel financeiro completo
                  </li>
                </ul>
                <Button asChild className="w-full">
                  <Link to="/cadastro">Assinar depois do cadastro</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-6" id="seguranca">
        <div className="grid gap-6 rounded-lg border border-border bg-card p-6 shadow-sm lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="max-w-3xl space-y-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-md bg-primary/10 text-primary">
              <LockKeyhole className="h-5 w-5" />
            </div>
            <h2 className="text-3xl font-semibold tracking-normal">
              Organização para o dia a dia
            </h2>
            <p className="text-muted-foreground">
              O sistema foi pensado para uso recorrente: mês de referência,
              vencimentos, cartões e relatórios ficam conectados em um fluxo simples.
            </p>
          </div>
          <Button asChild className="h-11 px-5">
            <Link to="/cadastro">
              Criar minha conta
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
