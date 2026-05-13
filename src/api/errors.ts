import axios from "axios";

type ApiErrorResponse = {
  message?: string;
};

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    return (
      error.response?.data?.message ??
      "Não foi possível concluir a operação."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Não foi possível conectar com a API.";
}
