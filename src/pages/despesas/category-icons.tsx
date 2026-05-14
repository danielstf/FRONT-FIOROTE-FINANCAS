import {
  Baby,
  Banknote,
  BookOpen,
  BriefcaseBusiness,
  Bus,
  Car,
  Dumbbell,
  GraduationCap,
  HeartPulse,
  Home,
  MoreHorizontal,
  PawPrint,
  Plane,
  Popcorn,
  ReceiptText,
  ShieldCheck,
  Shirt,
  ShoppingBasket,
  Smartphone,
  Sparkles,
  Tv,
  Utensils,
  Wifi,
  type LucideIcon,
} from "lucide-react";

export const defaultExpenseCategories = [
  "Alimentação",
  "Mercado",
  "Moradia",
  "Transporte",
  "Combustível",
  "Saúde",
  "Educação",
  "Lazer",
  "Assinaturas",
  "Internet",
  "Telefone",
  "Roupas",
  "Viagem",
  "Pets",
  "Filhos",
  "Academia",
  "Impostos",
  "Seguro",
  "Trabalho",
  "Livros",
  "Beleza",
  "Contas",
  "Outras",
];

const categoryIconMap: Record<string, LucideIcon> = {
  alimentacao: Utensils,
  mercado: ShoppingBasket,
  moradia: Home,
  transporte: Bus,
  combustivel: Car,
  saude: HeartPulse,
  educacao: GraduationCap,
  lazer: Popcorn,
  assinaturas: Tv,
  internet: Wifi,
  telefone: Smartphone,
  roupas: Shirt,
  viagem: Plane,
  pets: PawPrint,
  filhos: Baby,
  academia: Dumbbell,
  impostos: Banknote,
  seguro: ShieldCheck,
  trabalho: BriefcaseBusiness,
  livros: BookOpen,
  beleza: Sparkles,
  contas: ReceiptText,
  outras: MoreHorizontal,
  outros: MoreHorizontal,
};

const categoryColorMap: Record<string, string> = {
  alimentacao: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  mercado: "bg-lime-500/10 text-lime-700 dark:text-lime-400",
  moradia: "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  transporte: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  combustivel: "bg-orange-500/10 text-orange-700 dark:text-orange-400",
  saude: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
  educacao: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  lazer: "bg-fuchsia-500/10 text-fuchsia-700 dark:text-fuchsia-400",
  assinaturas: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  internet: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  telefone: "bg-slate-500/10 text-slate-700 dark:text-slate-300",
  roupas: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  viagem: "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  pets: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  filhos: "bg-purple-500/10 text-purple-700 dark:text-purple-400",
  academia: "bg-red-500/10 text-red-700 dark:text-red-400",
  impostos: "bg-zinc-500/10 text-zinc-700 dark:text-zinc-300",
  seguro: "bg-green-500/10 text-green-700 dark:text-green-400",
  trabalho: "bg-stone-500/10 text-stone-700 dark:text-stone-300",
  livros: "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400",
  beleza: "bg-pink-500/10 text-pink-700 dark:text-pink-400",
  contas: "bg-red-500/10 text-red-700 dark:text-red-400",
};

function normalizeCategoryKey(category: string) {
  return category
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("pt-BR")
    .trim();
}

export function getCategoryIcon(category?: string | null) {
  if (!category) return MoreHorizontal;

  return categoryIconMap[normalizeCategoryKey(category)] ?? MoreHorizontal;
}

export function getCategoryColor(category?: string | null) {
  if (!category) return "bg-muted text-muted-foreground";

  return categoryColorMap[normalizeCategoryKey(category)] ?? "bg-muted text-muted-foreground";
}
