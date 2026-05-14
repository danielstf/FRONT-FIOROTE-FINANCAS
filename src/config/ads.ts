export type AppAd = {
  title: string;
  description: string;
  cta: string;
  href: string;
};

export const appAds: AppAd[] = [
  {
    title: "Organize suas finanças sem anúncios",
    description:
      "Assine o Premium para remover propagandas e manter o painel mais limpo.",
    cta: "Ver Premium",
    href: "/app/premium",
  },
  {
    title: "Controle despesas com mais clareza",
    description:
      "Cadastre vencimentos, formas de pagamento e acompanhe contas pendentes.",
    cta: "Cadastrar despesa",
    href: "/app/despesas/cadastro",
  },
];
