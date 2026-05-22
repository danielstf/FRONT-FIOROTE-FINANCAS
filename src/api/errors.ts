import axios from "axios";

type ApiErrorResponse = {
  message?: string;
  error?: string;
  issues?: Array<{ message?: string }>;
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

const friendlyMessages: Record<string, string> = {
  "Dados invalidos": "Revise as informações preenchidas e tente novamente.",
  "Email ou senha invalidos": "E-mail ou senha inválidos.",
  "not authorized": "Sua sessão expirou. Faça login novamente.",
  "Not authorized": "Você não tem permissão para acessar esta área.",
  "Usuario nao encontrado": "Usuário não encontrado.",
  "Usuário não encontrado.": "Usuário não encontrado.",
  "Usuario ja existe com esse email": "Já existe uma conta com este e-mail.",
  "Perfil financeiro invalido": "Não foi possível acessar este perfil financeiro.",
  "Recurso disponivel apenas no Premium":
    "Este recurso está disponível apenas para usuários Premium.",
  "Recurso disponivel apenas para usuarios Premium":
    "Este recurso está disponível apenas para usuários Premium.",
  "Este recurso está disponível apenas para usuários Premium.":
    "Este recurso está disponível apenas para usuários Premium.",
  "Assinatura premium ativa nao encontrada":
    "Não encontramos uma assinatura Premium ativa para cancelar.",
  "Erro ao criar checkout premium":
    "Não foi possível iniciar o pagamento Premium. Tente novamente.",
  "Erro ao cancelar assinatura premium":
    "Não foi possível cancelar a assinatura agora. Tente novamente.",
  "Erro ao consultar premium":
    "Não foi possível carregar as informações do Premium.",
};

function normalizeApiMessage(message?: string) {
  if (!message) return "";

  const cleaned = message.trim();
  return friendlyMessages[cleaned] ?? cleaned;
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    if (!error.response) {
      return "Não foi possível conectar ao servidor. Verifique sua internet e tente novamente.";
    }

    const apiMessage = normalizeApiMessage(
      error.response.data?.message ?? error.response.data?.error,
    );
    const issueMessage = normalizeApiMessage(
      error.response.data?.issues?.find((issue) => issue.message)?.message,
    );

    return (
      issueMessage ||
      apiMessage ||
      statusMessages[error.response.status] ||
      "Não foi possível concluir a operação."
    );
  }

  if (error instanceof Error) {
    return normalizeApiMessage(error.message) || "Não foi possível concluir a operação.";
  }

  return "Não foi possível concluir a operação.";
}
