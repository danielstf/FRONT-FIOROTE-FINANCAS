import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Send } from "lucide-react";
import { authApi } from "../../../api/auth/auth-api";
import { getApiErrorMessage } from "../../../api/errors";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";

export function EsqueciSenhaPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await authApi.solicitarRedefinicaoSenha({ email });
      setMessage(response.message);
    } catch (requestError) {
      setError(getApiErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <Button asChild className="mb-3 w-fit px-0" variant="ghost">
          <Link to="/login">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>
        </Button>
        <CardTitle>Esqueci minha senha</CardTitle>
        <CardDescription>
          Informe seu email para receber as instruções de redefinição.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                className="pl-9"
                required
              />
            </div>
          </div>

          {error && (
            <p className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
          {message && (
            <p className="rounded-md border border-primary/25 bg-primary/10 px-3 py-2 text-sm text-primary">
              {message}
            </p>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            <Send className="h-4 w-4" />
            Enviar instruções
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
