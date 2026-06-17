export type SugestaoTipo = "RECLAMACAO" | "ELOGIO" | "SUGESTAO" | "OUTRO";

export type CriarSugestaoPayload = {
  tipo: SugestaoTipo;
  titulo: string;
  mensagem: string;
};

export type Sugestao = {
  id: string;
  tipo: SugestaoTipo;
  titulo: string;
  mensagem: string;
  status: "ABERTO" | "FINALIZADO";
  criadoEm: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
    plano: "FREE" | "PREMIUM";
  };
};

export type ListarSugestoesResponse = {
  sugestoes: Sugestao[];
};
