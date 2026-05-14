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
