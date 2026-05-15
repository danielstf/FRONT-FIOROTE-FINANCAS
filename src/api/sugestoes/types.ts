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
  criadoEm: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
};

export type ListarSugestoesResponse = {
  sugestoes: Sugestao[];
};
