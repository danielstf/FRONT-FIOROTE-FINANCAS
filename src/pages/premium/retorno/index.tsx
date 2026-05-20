import { Link, useParams } from "react-router-dom";
import { AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../../components/ui/card";

const content = {
  sucesso: {
    icon: CheckCircle2,
    title: "Assinatura iniciada",
    description:
      "Recebemos o retorno de sucesso do Mercado Pago. Atualize o status no painel Premium para confirmar a ativação.",
  },
  pendente: {
    icon: Clock,
    title: "Assinatura pendente",
    description:
      "O Mercado Pago marcou a assinatura como pendente. Assim que for aprovada, seu plano será atualizado.",
  },
  falha: {
    icon: AlertTriangle,
    title: "Assinatura não concluída",
    description:
      "A assinatura não foi concluída. Você pode voltar ao painel Premium e tentar novamente.",
  },
};

export function PremiumRetornoPage() {
  const { status } = useParams();
  const page = content[status as keyof typeof content] ?? content.falha;
  const Icon = page.icon;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-5 py-10 text-foreground">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Icon className="h-6 w-6" />
          </div>
          <CardTitle>{page.title}</CardTitle>
          <CardDescription>{page.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className="w-full">
            <Link to="/app/premium">Voltar para Premium</Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
