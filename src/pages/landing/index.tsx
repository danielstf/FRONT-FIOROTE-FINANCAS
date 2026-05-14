import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CreditCard,
  PieChart,
  ReceiptText,
  ShieldCheck,
  Sparkles,
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
    description: "Cadastre entradas, contas, parcelas, vencimentos e despesas fixas.",
    icon: WalletCards,
  },
  {
    title: "Dashboard mensal",
    description: "Veja saldo, pendências, contas vencidas e movimentação do mês.",
    icon: BarChart3,
  },
  {
    title: "Relatórios visuais",
    description: "Graficos de area, pizza e comparativos mensais e anuais.",
    icon: PieChart,
  },
  {
    title: "Cartões salvos",
    description: "Organize gastos no crédito por cartão cadastrado na sua conta.",
    icon: CreditCard,
  },
];

export function LandingPage() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 lg:px-6">
          <BrandLogo />
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a className="hover:text-foreground" href="#funcoes">
              Funcoes
            </a>
            <a className="hover:text-foreground" href="#precos">
              Precos
            </a>
            <a className="hover:text-foreground" href="#seguranca">
              Seguranca
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild variant="outline">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild className="hidden sm:inline-flex">
              <Link to="/cadastro">
                Comecar
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <section className="border-b border-border">
        <div className="mx-auto grid min-h-[calc(100vh-4rem)] w-full max-w-7xl items-center gap-10 px-4 py-12 lg:grid-cols-[1fr_520px] lg:px-6">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-md border border-primary/20 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="h-4 w-4" />
              Gestao financeira simples e visual
            </div>
            <div className="space-y-4">
              <h1 className="max-w-3xl text-5xl font-semibold leading-tight tracking-normal text-foreground lg:text-6xl">
                Minhas Financas Fiorote
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Controle receitas, despesas, cartões, relatórios e premium em uma
                interface profissional feita para enxergar o mês com clareza.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link to="/cadastro">
                  Criar conta gratis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/login">Acessar minha conta</Link>
              </Button>
            </div>
            <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-primary" />
                Plano free
              </span>
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Conta segura
              </span>
              <span className="inline-flex items-center gap-2">
                <ReceiptText className="h-4 w-4 text-primary" />
                Sem planilhas
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 shadow-xl">
            <div className="rounded-lg border border-border bg-muted/35 p-4">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Resumo de maio</p>
                  <p className="text-2xl font-semibold text-foreground">
                    R$ 4.820,00
                  </p>
                </div>
                <div className="rounded-md bg-primary/10 p-3 text-primary">
                  <BarChart3 className="h-6 w-6" />
                </div>
              </div>
              <div className="grid gap-3">
                {[
                  ["Receitas", "R$ 7.200,00", "bg-blue-500", "72%"],
                  ["Despesas", "R$ 2.380,00", "bg-red-500", "38%"],
                  ["Saldo", "R$ 4.820,00", "bg-emerald-500", "58%"],
                ].map(([label, value, color, width]) => (
                  <div className="rounded-md border border-border bg-card p-3" key={label}>
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-semibold">{value}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted">
                      <div className={`h-2 rounded-full ${color}`} style={{ width }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-6" id="funcoes">
        <div className="mb-8 max-w-2xl space-y-2">
          <h2 className="text-3xl font-semibold tracking-normal">Funcoes principais</h2>
          <p className="text-muted-foreground">
            Tudo que você precisa para fechar o mês, acompanhar atrasos e tomar
            decisoes melhores.
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
        <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-16 lg:grid-cols-2 lg:px-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Free</CardTitle>
              <CardDescription>Para iniciar o controle financeiro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-semibold">R$ 0</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Receitas e despesas</li>
                <li>Relatórios mensais e anuais</li>
                <li>Anuncios do sistema</li>
              </ul>
              <Button asChild className="w-full" variant="outline">
                <Link to="/cadastro">Comecar gratis</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-primary/35 shadow-sm">
            <CardHeader>
              <CardTitle>Premium</CardTitle>
              <CardDescription>Mais foco, sem anuncios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-4xl font-semibold">
                R$ 19,90 <span className="text-sm text-muted-foreground">/mês</span>
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>Sem anuncios</li>
                <li>Experiencia mais limpa</li>
                <li>Mesmo painel financeiro completo</li>
              </ul>
              <Button asChild className="w-full">
                <Link to="/cadastro">Assinar depois do cadastro</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="mx-auto w-full max-w-7xl px-4 py-16 lg:px-6" id="seguranca">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Organização para o dia a dia</CardTitle>
            <CardDescription>
              O sistema foi pensado para uso recorrente: mês de referência,
              vencimentos, cartões e relatórios ficam conectados em um fluxo simples.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/cadastro">
                Criar minha conta
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
