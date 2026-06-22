import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BellRing,
  BookOpen,
  CheckCircle2,
  CreditCard,
  FileSpreadsheet,
  HelpCircle,
  Layers3,
  Lightbulb,
  LockKeyhole,
  MonitorSmartphone,
  PieChart,
  Repeat2,
  Smartphone,
  Star,
  TrendingDown,
  TrendingUp,
  UserPlus,
  WalletCards,
  Zap,
} from "lucide-react";
import { useLayoutEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { BrandLogo } from "../../components/brand-logo";
import { Button } from "../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

// ─── Data ────────────────────────────────────────────────────────────────────

const features = [
  {
    title: "Controle financeiro",
    description:
      "Cadastre receitas, despesas, cartões, vencimentos e pagamentos em poucos cliques.",
    icon: WalletCards,
  },
  {
    title: "Relatórios Premium",
    description:
      "Compare meses, anos e categorias com gráficos claros e exportação Excel.",
    icon: PieChart,
  },
  {
    title: "Exportação Excel",
    description:
      "Baixe relatórios completos por mês, ano ou intervalos personalizados.",
    icon: FileSpreadsheet,
  },
  {
    title: "Perfis financeiros",
    description:
      "Separe dados por perfil: pessoal, familiar ou empresarial, tudo num só lugar.",
    icon: Layers3,
  },
  {
    title: "Recorrências",
    description:
      "Controle receitas e despesas fixas com exclusão por mês ou a partir de uma data.",
    icon: Repeat2,
  },
  {
    title: "Web e Android",
    description:
      "Acesse no navegador ou no aplicativo Android — sincronizado em tempo real.",
    icon: Smartphone,
  },
];

const steps = [
  {
    step: "01",
    icon: UserPlus,
    title: "Crie sua conta grátis",
    description:
      "Cadastro rápido com e-mail ou Google. Nenhum cartão necessário para começar.",
  },
  {
    step: "02",
    icon: WalletCards,
    title: "Lance receitas e despesas",
    description:
      "Registre entradas, contas fixas, parcelamentos e cartões de crédito por mês.",
  },
  {
    step: "03",
    icon: BarChart3,
    title: "Acompanhe seu saldo",
    description:
      "Dashboard mensal com saldo, vencimentos e alertas para manter as finanças em dia.",
  },
];

const stats = [
  { value: "100%", label: "Gratuito para começar" },
  { value: "Web + App", label: "Android e navegador" },
  { value: "5 perfis", label: "Por conta Premium" },
  { value: "R$ 5/mês", label: "Plano Premium" },
];

const premiumItems = [
  "Relatórios visuais avançados",
  "Exportação Excel",
  "Até 5 perfis financeiros",
  "Receitas e despesas fixas",
  "Sem anúncios",
];

const freeItems = ["Receitas, despesas e cartões", "Dashboard mensal"];

const tips = [
  {
    icon: BookOpen,
    title: "Registre tudo, inclusive os pequenos gastos",
    body: "Um café, uma corrida de aplicativo, um lanche rápido — pequenos gastos diários podem representar até 20% do orçamento mensal sem que você perceba. O hábito de lançar cada saída no momento em que acontece é o primeiro passo para entender exatamente para onde vai o seu dinheiro.",
  },
  {
    icon: Repeat2,
    title: "Separe despesas fixas das variáveis",
    body: "Despesas fixas repetem o mesmo valor todo mês: aluguel, plano de saúde, assinaturas. Variáveis mudam de período para período: supermercado, lazer, vestuário. Ao classificar cada gasto, fica claro onde há espaço para economizar e quais compromissos são obrigatórios.",
  },
  {
    icon: TrendingDown,
    title: "Revise seus gastos a cada semana",
    body: "Reservar dez minutos semanais para conferir os lançamentos do mês evita que desvios se acumulem. Uma revisão rápida permite ajustar o comportamento antes que o orçamento feche no vermelho e cria o hábito de atenção contínua às finanças pessoais.",
  },
  {
    icon: TrendingUp,
    title: "Planeje o próximo mês com antecedência",
    body: "Antes de o mês começar, lance as despesas fixas já previstas e estime as variáveis com base nos meses anteriores. Essa previsão antecipada mostra o saldo esperado e ajuda a decidir com mais segurança sobre gastos extras ou quanto reservar para a poupança.",
  },
];

const faqs = [
  {
    q: "O que é controle financeiro pessoal?",
    a: "Controle financeiro pessoal é o hábito de registrar e acompanhar todas as receitas e despesas ao longo do mês. Com esse acompanhamento, você sabe exatamente para onde vai o seu dinheiro, identifica pontos de desperdício e toma decisões mais conscientes sobre gastos, dívidas e objetivos de poupança.",
  },
  {
    q: "Por onde começo a organizar minhas finanças?",
    a: "O primeiro passo é registrar todas as entradas e saídas do mês atual, sem julgamento. Separe por categorias básicas como alimentação, moradia, transporte e lazer. Com apenas alguns lançamentos, você já tem uma visão real do seu saldo e consegue identificar os maiores pontos de gasto.",
  },
  {
    q: "Qual a diferença entre despesa fixa e variável?",
    a: "Despesa fixa ocorre todo mês com o mesmo valor: aluguel, assinatura de streaming, plano de saúde. Despesa variável muda de mês para mês: supermercado, combustível, lazer. Separar essas categorias ajuda a entender o compromisso mínimo mensal e onde há flexibilidade para reduzir gastos.",
  },
  {
    q: "Como controlar os gastos do cartão de crédito?",
    a: "O segredo é lançar cada compra no momento em que acontece, antes de esperar a fatura fechar. Assim você acompanha o total acumulado em tempo real e evita surpresas. Vincular cada compra ao cartão correto no aplicativo também ajuda a ter uma visão separada dos gastos por conta de pagamento.",
  },
  {
    q: "Quanto devo poupar por mês?",
    a: "A regra clássica de finanças pessoais recomenda guardar pelo menos 10% da renda líquida mensal. O mais importante é criar o hábito, mesmo começando com valores menores. Ao acompanhar os gastos com regularidade, fica mais fácil identificar onde cortar e aumentar gradualmente o percentual poupado.",
  },
  {
    q: "O Fiorote funciona no celular?",
    a: "Sim. O Fiorote Controle Financeiro está disponível tanto na versão web, acessível por qualquer navegador, quanto no aplicativo para Android. Os dados ficam sincronizados em tempo real entre os dispositivos, então um lançamento feito pelo celular aparece imediatamente no computador.",
  },
];

// ─── Animations ──────────────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const easeOut = {
  duration: 0.65,
  ease: [0.22, 1, 0.36, 1],
} as const;

function delay(d: number) {
  return { ...easeOut, delay: d };
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
      {children}
    </p>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
      {children}
    </h2>
  );
}

function SectionDescription({ children }: { children: React.ReactNode }) {
  return (
    <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
      {children}
    </p>
  );
}

function AnimatedSection({
  children,
  className,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <motion.div
      className={className}
      id={id}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      variants={fadeUp}
      transition={easeOut}
    >
      {children}
    </motion.div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function LandingPage() {
  useLayoutEffect(() => {
    const html = document.documentElement;
    const wasDark = html.classList.contains("dark");
    if (wasDark) html.classList.remove("dark");
    return () => {
      if (wasDark) html.classList.add("dark");
    };
  }, []);

  return (
    <main className="theme-static-light min-h-screen bg-background text-foreground">
      {/* ── Camada decorativa global (fixed, atrás de tudo) ─────────────────── */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        {/* Blob superior direito */}
        <div className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full bg-primary/5 blur-3xl animate-float-slow" style={{ animationDelay: "-3s" }} />
        {/* Blob inferior esquerdo */}
        <div className="absolute -bottom-40 -left-40 h-[420px] w-[420px] rounded-full bg-blue-400/4 blur-3xl animate-drift" style={{ animationDelay: "-7s" }} />
        {/* Blob central sutil */}
        <div className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/3 blur-3xl animate-float" style={{ animationDelay: "-1s" }} />
      </div>

      {/* ── HEADER ─────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-border/60 bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 lg:h-20 lg:px-8">
          <BrandLogo className="min-w-0 flex-1 sm:flex-none" size="nav" forceTheme="light" />

          <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground lg:flex xl:gap-8">
            <a className="transition-colors hover:text-foreground" href="#funcoes">
              Funções
            </a>
            <a className="transition-colors hover:text-foreground" href="#como-funciona">
              Como funciona
            </a>
            <a className="transition-colors hover:text-foreground" href="#precos">
              Planos
            </a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Button asChild className="hidden sm:inline-flex" variant="ghost">
              <Link to="/login">Entrar</Link>
            </Button>
            <Button asChild>
              <Link to="/cadastro">
                <span className="sm:hidden">Começar</span>
                <span className="hidden sm:inline">Começar grátis</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* ── HERO ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Grid de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
          }}
        />
        {/* Linhas diagonais sutis */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 32px)",
          }}
        />
        {/* Glow central principal */}
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 h-[600px] w-[900px] -translate-x-1/2 rounded-full bg-primary/6 blur-3xl"
        />
        {/* Blob animado superior esquerdo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 top-10 h-64 w-64 rounded-full bg-primary/7 blur-3xl animate-float-slow"
          style={{ animationDelay: "-4s" }}
        />
        {/* Blob animado inferior direito */}
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-20 right-0 h-80 w-80 rounded-full bg-blue-400/5 blur-3xl animate-drift"
          style={{ animationDelay: "-6s" }}
        />
        {/* Círculo decorativo — anel grande */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-1/2 h-[500px] w-[500px] -translate-y-1/2 rounded-full border border-primary/8"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-48 top-1/2 h-[640px] w-[640px] -translate-y-1/2 rounded-full border border-primary/4"
        />
        {/* Grid de pontos — canto superior direito */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-52 w-52 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px",
          }}
        />
        {/* Grid de pontos — canto inferior esquerdo */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-40 w-40 opacity-[0.05]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative mx-auto grid min-h-[calc(100vh-5rem)] w-full max-w-7xl items-center gap-16 px-4 py-16 lg:grid-cols-[minmax(0,1fr)_480px] lg:px-8 lg:py-24">
          {/* Left copy */}
          <div className="max-w-2xl space-y-8">
            <motion.div
              className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/8 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={delay(0)}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Gestão financeira simples e visual
            </motion.div>

            <motion.div
              className="space-y-5"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={delay(0.1)}
            >
              <h1 className="text-5xl font-bold leading-[1.1] tracking-tight sm:text-6xl lg:text-[4rem]">
                Organize seu{" "}
                <span className="relative inline-block">
                  <span className="relative z-10 text-primary">dinheiro</span>
                  <span
                    aria-hidden
                    className="absolute bottom-1 left-0 z-0 h-3 w-full rounded-sm bg-primary/15"
                  />
                </span>{" "}
                todos os meses
              </h1>
              <p className="text-base leading-7 text-muted-foreground sm:text-lg">
                Controle entradas, contas, cartões, perfis financeiros,
                recorrências e relatórios com exportação Excel. Funciona na web
                e no app Android.
              </p>
            </motion.div>

            <motion.div
              className="flex flex-col gap-3 sm:flex-row"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={delay(0.2)}
            >
              <Button asChild className="h-11 rounded-lg px-6 text-sm font-semibold">
                <Link to="/cadastro">
                  Criar conta grátis
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-lg px-6 text-sm">
                <Link to="/login">Acessar minha conta</Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex flex-wrap gap-5 text-xs font-medium text-muted-foreground"
              initial="hidden"
              animate="visible"
              variants={fadeUp}
              transition={delay(0.3)}
            >
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
            </motion.div>
          </div>

          {/* Right — mock dashboard */}
          <motion.div
            className="relative rounded-2xl border border-border bg-card p-6 shadow-2xl ring-1 ring-primary/8"
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={delay(0.28)}
            whileHover={{ y: -6, transition: { duration: 0.3 } }}
          >
            {/* Linha decorativa no topo do card */}
            <div
              aria-hidden
              className="absolute inset-x-8 -top-px h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary/50 to-transparent"
            />
            {/* Glow interno sutil */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/4 via-transparent to-transparent"
            />

            <div className="relative mb-6 flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Perfil Família · Mai 2025
                </p>
                <p className="mt-1.5 text-4xl font-bold text-emerald-500">
                  R$ 4.820,00
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">Saldo positivo</p>
              </div>
              <div className="rounded-xl bg-primary/10 p-3 text-primary">
                <BarChart3 className="h-6 w-6" />
              </div>
            </div>

            <div className="relative grid gap-2.5">
              {[
                { label: "Receitas", value: "R$ 7.200,00", detail: "Entradas do mês", color: "text-emerald-500" },
                { label: "Despesas", value: "R$ 2.380,00", detail: "Contas e cartões", color: "text-rose-500" },
                { label: "Saldo", value: "R$ 4.820,00", detail: "Positivo", color: "text-foreground" },
              ].map(({ label, value, detail, color }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-muted/40 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <span className="text-muted-foreground">{label}</span>
                    <span className={`font-bold ${color}`}>{value}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">{detail}</p>
                </div>
              ))}
            </div>

            <div className="relative mt-5 rounded-xl border border-border bg-background/60 p-4">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
                Recursos ativos
              </p>
              <div className="grid gap-2.5 text-sm">
                {[
                  { label: "Cartão principal", icon: CreditCard, color: "text-primary" },
                  { label: "Receita fixa mensal", icon: Repeat2, color: "text-emerald-500" },
                  { label: "Relatório Excel", icon: FileSpreadsheet, color: "text-primary" },
                ].map(({ label, icon: Icon, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <span className="text-muted-foreground">{label}</span>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── STATS ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border bg-muted/20">
        {/* Dot grid de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "20px 20px",
          }}
        />
        {/* Gradiente de borda */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-10 lg:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map(({ value, label }, i) => (
              <motion.div
                key={label}
                className="text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.4 }}
                variants={fadeUp}
                transition={delay(i * 0.07)}
              >
                <p className="text-2xl font-bold text-foreground sm:text-3xl">{value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DICAS FINANCEIRAS ──────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute left-0 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/4 blur-3xl animate-float-slow"
          style={{ animationDelay: "-3s" }}
        />
        <AnimatedSection className="mb-12 space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <Lightbulb className="h-3.5 w-3.5" />
            Dicas práticas
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Hábitos que fazem diferença no bolso
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Pequenas mudanças na forma de registrar e acompanhar as finanças geram grandes resultados ao
            longo do tempo. Veja por onde começar.
          </p>
        </AnimatedSection>

        <div className="grid gap-5 md:grid-cols-2">
          {tips.map((tip, i) => (
            <motion.div
              key={tip.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              transition={delay(i * 0.07)}
            >
              <div className="group relative h-full rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/35 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <tip.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-foreground">{tip.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{tip.body}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ───────────────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-8" id="funcoes">
        {/* Blob decorativo atrás das features */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl animate-float-slow"
          style={{ animationDelay: "-2s" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -left-10 bottom-20 h-56 w-56 rounded-full bg-blue-400/4 blur-3xl animate-drift"
          style={{ animationDelay: "-5s" }}
        />

        <AnimatedSection className="mb-12 space-y-3">
          <SectionLabel>Funcionalidades</SectionLabel>
          <SectionHeading>O que você encontra aqui</SectionHeading>
          <SectionDescription>
            O essencial está no plano grátis. Relatórios, exportação e perfis
            múltiplos ficam no Premium.
          </SectionDescription>
        </AnimatedSection>

        <div className="relative grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              transition={delay(i * 0.06)}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
            >
              <Card className="group relative h-full overflow-hidden border-border/60 shadow-none transition-shadow hover:shadow-md">
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                {/* Glow interno no hover */}
                <div
                  aria-hidden
                  className="absolute inset-0 bg-gradient-to-br from-primary/4 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <CardHeader className="relative gap-4">
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
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden border-y border-border bg-muted/20"
        id="como-funciona"
      >
        {/* Dot grid de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "22px 22px",
          }}
        />
        {/* Linhas diagonais */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 28px)",
          }}
        />
        {/* Blob central animado */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-80 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-float"
          style={{ animationDelay: "-2.5s" }}
        />
        {/* Anéis decorativos */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-primary/8"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-1/2 h-64 w-64 -translate-y-1/2 rounded-full border border-primary/6"
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <AnimatedSection className="mb-14 space-y-3">
            <SectionLabel>Como funciona</SectionLabel>
            <SectionHeading>Comece em menos de 2 minutos</SectionHeading>
            <SectionDescription>
              Sem configurações complexas — é só criar a conta e lançar suas
              primeiras movimentações.
            </SectionDescription>
          </AnimatedSection>

          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connecting line (desktop) */}
            <div
              aria-hidden
              className="absolute top-10 left-[16.67%] right-[16.67%] hidden h-px bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20 md:block"
            />

            {steps.map(({ step, icon: Icon, title, description }, i) => (
              <motion.div
                key={step}
                className="relative flex flex-col items-center gap-4 text-center"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.2 }}
                variants={fadeUp}
                transition={delay(i * 0.1)}
              >
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-primary/25 bg-primary/8 text-primary shadow-sm ring-4 ring-background">
                  {/* Anel pulsante externo */}
                  <div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl border border-primary/15 animate-pulse-ring"
                    style={{ animationDelay: `${i * 0.4}s` }}
                  />
                  <Icon className="h-8 w-8" />
                  <span className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground shadow">
                    {step}
                  </span>
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-base font-semibold text-foreground">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ────────────────────────────────────────────────────────── */}
      <section id="precos" className="relative overflow-hidden">
        {/* Blob atrás dos cards */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/4 top-1/2 h-[350px] w-[350px] -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-float-slow"
          style={{ animationDelay: "-1s" }}
        />
        {/* Grid de pontos — canto direito */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-0 h-64 w-64 opacity-[0.045]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "16px 16px",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <AnimatedSection className="mb-14 space-y-3">
            <SectionLabel>Planos</SectionLabel>
            <SectionHeading>Comece grátis, evolua quando precisar</SectionHeading>
            <SectionDescription>
              O Premium libera relatórios completos, exportação Excel, perfis
              financeiros e remove anúncios.
            </SectionDescription>
          </AnimatedSection>

          <div className="grid gap-5 md:grid-cols-2 lg:max-w-3xl">
            {/* Free */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              transition={delay(0.08)}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
            >
              <Card className="h-full border-border/60 shadow-sm">
                <CardHeader className="pb-4">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Grátis
                  </p>
                  <CardTitle className="text-4xl font-bold">R$ 0</CardTitle>
                  <CardDescription className="text-sm">
                    Para começar o controle financeiro sem custo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {freeItems.map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                        {item}
                      </li>
                    ))}
                    <li className="flex items-center gap-2.5 opacity-55">
                      <BellRing className="h-4 w-4 shrink-0" />
                      Exibição de anúncios
                    </li>
                  </ul>
                  <Button asChild className="w-full" variant="outline">
                    <Link to="/cadastro">Começar grátis</Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Premium */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              transition={delay(0.18)}
              whileHover={{ y: -5, transition: { duration: 0.25 } }}
            >
              <Card className="relative h-full border-primary/35 shadow-lg">
                <div
                  aria-hidden
                  className="absolute inset-x-6 -top-px h-0.5 rounded-full bg-gradient-to-r from-transparent via-primary to-transparent"
                />
                {/* Glow interno do card premium */}
                <div
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-br from-primary/6 via-transparent to-transparent"
                />
                <CardHeader className="relative pb-4">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-widest text-primary">
                      Premium
                    </p>
                    <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-[11px] font-semibold text-primary">
                      <Star className="h-3 w-3 fill-primary" />
                      Recomendado
                    </span>
                  </div>
                  <CardTitle className="text-4xl font-bold">
                    R$ 5,00{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      /mês
                    </span>
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Para quem quer visibilidade total das finanças.
                  </CardDescription>
                </CardHeader>
                <CardContent className="relative space-y-5">
                  <ul className="space-y-2.5 text-sm text-muted-foreground">
                    {premiumItems.map((item) => (
                      <li key={item} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full">
                    <Link to="/cadastro">
                      Criar conta
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── TRUST ──────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-border bg-muted/20">
        {/* Linhas diagonais sutis */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, currentColor 0px, currentColor 1px, transparent 1px, transparent 24px)",
          }}
        />
        {/* Blob animado */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-1/4 top-0 h-64 w-64 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl animate-float-slow"
          style={{ animationDelay: "-3.5s" }}
        />
        {/* Gradiente de borda superior */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/25 to-transparent"
        />

        <div className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
          <AnimatedSection className="mb-12 space-y-3">
            <SectionLabel>Segurança e rotina</SectionLabel>
            <SectionHeading>Feito para uso diário</SectionHeading>
            <SectionDescription>
              O Fiorote Controle Financeiro prioriza leitura rápida, organização
              por mês e recursos úteis para quem acompanha o próprio dinheiro
              com frequência.
            </SectionDescription>
          </AnimatedSection>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { n: "01", icon: LockKeyhole, title: "Login protegido", desc: "Autenticação por e-mail ou Google." },
              { n: "02", icon: Zap, title: "Dados por mês", desc: "Organização mensal clara e sem ruído." },
              { n: "03", icon: BarChart3, title: "Dashboard de decisão", desc: "Saldo, vencimentos e alertas rápidos." },
              { n: "04", icon: FileSpreadsheet, title: "Exportação Premium", desc: "Excel completo quando precisar." },
            ].map(({ n, icon: Icon, title, desc }, i) => (
              <motion.div
                key={n}
                className="group relative rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.15 }}
                variants={fadeUp}
                transition={delay(i * 0.07)}
                whileHover={{ y: -5, transition: { duration: 0.25 } }}
              >
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                {/* Glow interno */}
                <div
                  aria-hidden
                  className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/4 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="relative mt-4 text-sm font-semibold text-foreground">{title}</h3>
                <p className="relative mt-1 text-xs leading-relaxed text-muted-foreground">{desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="relative mx-auto w-full max-w-7xl px-4 py-20 lg:px-8">
        <div
          aria-hidden
          className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-primary/4 blur-3xl animate-drift"
          style={{ animationDelay: "-4s" }}
        />
        <AnimatedSection className="mb-12 space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-primary">
            <HelpCircle className="h-3.5 w-3.5" />
            Perguntas frequentes
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Dúvidas sobre finanças pessoais
          </h2>
          <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
            Respostas diretas sobre controle financeiro e como o Fiorote pode ajudar no seu
            dia a dia.
          </p>
        </AnimatedSection>

        <div className="grid gap-4 md:grid-cols-2">
          {faqs.map((item, i) => (
            <motion.div
              key={item.q}
              className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.15 }}
              variants={fadeUp}
              transition={delay(i * 0.06)}
            >
              <h3 className="flex items-start gap-2 text-sm font-semibold text-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                {item.q}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Fundo com gradiente */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-primary/4"
        />
        {/* Grid de fundo */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.022]"
          style={{
            backgroundImage:
              "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
        {/* Glow principal */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/8 blur-3xl"
        />
        {/* Blobs laterais animados */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-primary/6 blur-3xl animate-float-slow"
          style={{ animationDelay: "-2s" }}
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-20 top-0 h-56 w-56 rounded-full bg-blue-400/5 blur-3xl animate-drift"
          style={{ animationDelay: "-4s" }}
        />
        {/* Anéis decorativos */}
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/8"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-1/2 h-[550px] w-[550px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/5"
        />
        {/* Grid de pontos */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 right-0 h-40 w-40 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle, currentColor 1.5px, transparent 1.5px)",
            backgroundSize: "14px 14px",
          }}
        />

        <div className="relative mx-auto flex w-full max-w-3xl flex-col items-center gap-6 px-4 py-24 text-center lg:px-8">
          <AnimatedSection className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Comece agora
            </p>
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl">
              Suas finanças organizadas em minutos
            </h2>
            <p className="text-base text-muted-foreground sm:text-lg">
              Crie sua conta grátis e comece a lançar receitas e despesas hoje
              mesmo. Sem cartão de crédito.
            </p>
          </AnimatedSection>

          <motion.div
            className="flex flex-col gap-3 sm:flex-row"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.4 }}
            variants={fadeUp}
            transition={delay(0.15)}
          >
            <Button asChild className="h-12 rounded-lg px-8 text-sm font-semibold">
              <Link to="/cadastro">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-12 rounded-lg px-8 text-sm">
              <Link to="/login">Já tenho conta</Link>
            </Button>
          </motion.div>

          <motion.p
            className="text-xs text-muted-foreground"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            transition={delay(0.25)}
          >
            Plano grátis para sempre · Premium por R$ 5/mês
          </motion.p>
        </div>
      </section>

      {/* ── FOOTER ─────────────────────────────────────────────────────────── */}
      <footer className="relative bg-background">
        {/* Gradiente superior sutil */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        />
        <div className="mx-auto w-full max-w-7xl px-4 py-12 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <BrandLogo size="nav" forceTheme="light" />

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
              <a className="transition-colors hover:text-foreground" href="#funcoes">
                Funções
              </a>
              <a className="transition-colors hover:text-foreground" href="#precos">
                Planos
              </a>
              <Link className="transition-colors hover:text-foreground" to="/login">
                Entrar
              </Link>
              <Link className="transition-colors hover:text-foreground" to="/cadastro">
                Cadastrar
              </Link>
            </nav>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-border pt-8 text-xs text-muted-foreground sm:flex-row">
            <p>© {new Date().getFullYear()} Fiorote Controle Financeiro. Todos os direitos reservados.</p>
            <div className="flex items-center gap-4">
              <span className="inline-flex items-center gap-1.5">
                <BadgeCheck className="h-3.5 w-3.5 text-emerald-500" />
                Plano grátis disponível
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MonitorSmartphone className="h-3.5 w-3.5 text-primary" />
                Web e Android
              </span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
