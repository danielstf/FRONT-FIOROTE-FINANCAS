import type { SugestaoTipo } from "../sugestoes/types";

export type ContatoSuporte = {
  id: string;
  tipo: SugestaoTipo;
  titulo: string;
  mensagem: string;
  nome: string;
  email: string;
  status: "ABERTO" | "FINALIZADO";
  criadoEm: string;
};

export type CriarContatoPayload = {
  tipo: SugestaoTipo;
  titulo: string;
  mensagem: string;
  nome: string;
  email: string;
};

export type ListarContatosResponse = {
  contatos: ContatoSuporte[];
};
