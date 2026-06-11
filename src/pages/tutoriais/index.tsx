import { useState } from "react";
import { BookOpen, PlayCircle, Tv2 } from "lucide-react";
import { motion } from "motion/react";
import { PageHeader } from "../../components/page-header";
import { pageVariants, sectionVariants } from "../../lib/motion";
import { cn } from "../../lib/utils";

type Tutorial = {
  id: string;
  titulo: string;
  descricao: string;
  youtubeId: string;
  categoria: string;
  duracao?: string;
};

const tutoriais: Tutorial[] = [
  {
    id: "1",
    titulo: "Gerenciamento de Receitas",
    descricao: "Aprenda a cadastrar suas receitas no sistema, incluindo receitas fixas e parceladas.",
    youtubeId: "QaRa4l3Ogdg",
    categoria: "Receitas",
    duracao: "Primeiros passos",
  },
  {
    id: "2",
    titulo: "Gerenciamento de Despesas",
    descricao: "Veja como cadastrar e organizar suas despesas, com categorias, formas de pagamento e cartões.",
    youtubeId: "q9sMh0H4Wi4",
    categoria: "Despesas",
    duracao: "Primeiros passos",
  },
  {
    id: "3",
    titulo: "Dashboard",
    descricao: "Entenda como interpretar o painel principal: saldo, gráficos, projeções e resumo financeiro do mês.",
    youtubeId: "GkPazQAl61M",
    categoria: "Dashboard",
    duracao: "Primeiros passos",
  },
];

const categorias = ["Todos", ...new Set(tutoriais.map((t) => t.categoria))];

function TutorialCard({ tutorial, index }: { tutorial: Tutorial; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.07 * index, duration: 0.3 }}
      className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/30"
    >
      <div className="relative aspect-video w-full overflow-hidden bg-black">
        <iframe
          src={`https://www.youtube.com/embed/${tutorial.youtubeId}`}
          title={tutorial.titulo}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
      <div className="p-4">
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-primary">
            <PlayCircle className="h-3 w-3" />
            {tutorial.categoria}
          </span>
          {tutorial.duracao && (
            <span className="text-[10px] text-muted-foreground">{tutorial.duracao}</span>
          )}
        </div>
        <p className="text-sm font-semibold leading-snug">{tutorial.titulo}</p>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{tutorial.descricao}</p>
      </div>
    </motion.div>
  );
}

export function TutoriaisPage() {
  const [categoriaAtiva, setCategoriaAtiva] = useState("Todos");

  const visiveis =
    categoriaAtiva === "Todos"
      ? tutoriais
      : tutoriais.filter((t) => t.categoria === categoriaAtiva);

  return (
    <motion.div
      variants={pageVariants}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Page header */}
      <motion.div variants={sectionVariants}>
        <PageHeader
          icon={BookOpen}
          title="Tutoriais"
          subtitle="Aprenda a usar o sistema com nossos vídeos passo a passo"
        />
      </motion.div>

      {/* Hero banner */}
      <motion.div
        variants={sectionVariants}
        className="relative overflow-hidden rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-card to-card px-6 py-7"
      >
        <div aria-hidden className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-primary/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-12 left-1/3 h-36 w-36 rounded-full bg-primary/10 blur-2xl" />

        <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/12 px-3 py-1 text-xs font-semibold text-primary">
              <Tv2 className="h-3.5 w-3.5" />
              Central de aprendizado
            </div>
            <h2 className="text-xl font-bold tracking-tight">Fiorote Controle Financeiro</h2>
            <p className="max-w-md text-sm text-muted-foreground">
              Vídeos curtos e objetivos para você dominar cada funcionalidade e ter controle total das suas finanças.
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-center justify-center rounded-2xl border border-primary/20 bg-background/60 px-8 py-5 text-center backdrop-blur-sm">
            <span className="text-3xl font-black text-primary">{tutoriais.length}</span>
            <span className="mt-0.5 text-xs font-medium text-muted-foreground">
              {tutoriais.length === 1 ? "vídeo disponível" : "vídeos disponíveis"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Filtro de categorias + grid */}
      <motion.div variants={sectionVariants} className="overflow-hidden rounded-2xl border border-border bg-card">
        {/* Barra de filtros */}
        <div className="flex items-center gap-1.5 overflow-x-auto border-b border-border px-4 py-3 scrollbar-none">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoriaAtiva(cat)}
              className={cn(
                "shrink-0 rounded-full px-3.5 py-1.5 text-xs font-semibold transition-all duration-150",
                categoriaAtiva === cat
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "bg-muted text-muted-foreground hover:bg-muted/70 hover:text-foreground",
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid de vídeos */}
        <div className="p-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visiveis.map((tutorial, i) => (
              <TutorialCard key={tutorial.id} tutorial={tutorial} index={i} />
            ))}
          </div>

          {visiveis.length === 0 && (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Nenhum tutorial nesta categoria ainda.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
