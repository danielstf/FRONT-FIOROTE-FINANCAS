import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  error?: string;
};

const statusMessages: Record<number, string> = {
  400: "Confira os dados informados e tente novamente.",
  401: "Sua sessão expirou. Faça login novamente.",
  403: "Você não tem permissão para realizar esta ação.",
  404: "Não encontramos o registro solicitado.",
  405: "A operação não está disponível para este endereço. Verifique a URL da API.",
  409: "Já existe um registro com estes dados.",
  422: "Algum campo está inválido. Revise as informações.",
  429: "Muitas tentativas em pouco tempo. Aguarde alguns instantes.",
  500: "Erro interno na API. Tente novamente em alguns minutos.",
};

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return "Não foi possível conectar com a API. Verifique sua internet ou a URL configurada.";
    }

    return (
      error.response.data?.message ??
      error.response.data?.error ??
      statusMessages[error.response.status] ??
      "Não foi possível concluir a operação."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível conectar com a API.";
}
