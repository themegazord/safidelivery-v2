import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import {
  Info,
  TriangleAlert,
  CircleAlert,
  Lock,
  ArrowDownToLine,
} from "lucide-react";

export default function DialogConfirmarImportacaoAnotaai({
  open,
  onOpenChange,
  existeTokenAnotaai,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  existeTokenAnotaai: boolean;
}) {
  const { cnpj } = usePage<{ cnpj: string }>().props;
  const [processing, setProcessing] = useState(false);

  function importarCardapio() {
    setProcessing(true);
    router.post(
      route("aplicacao.empresa.cardapios.import_anotaai", { cnpj }),
      {},
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Cardápio importado com sucesso");
          onOpenChange(false);
        },
        onError: (errors) => {
          toast.error(Object.values(errors)[0] ?? "Erro ao importar cardápio");
        },
        onFinish: () => setProcessing(false),
      }
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Importar cardápio do Anota AI</DialogTitle>
          <DialogDescription>O que será importado?</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Alert>
            <Info />
            <AlertTitle>Itens que serão importados:</AlertTitle>
            <AlertDescription>
              <ul className="list-inside list-disc space-y-1">
                <li>Todas as categorias do cardápio</li>
                <li>Todos os itens/produtos</li>
                <li>Grupos de adicionais</li>
                <li>Adicionais individuais</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-500">
            <TriangleAlert />
            <AlertTitle>Importante sobre pizzas:</AlertTitle>
            <AlertDescription className="text-amber-700/90 dark:text-amber-400/90">
              <ul className="list-inside list-disc space-y-1">
                <li>
                  Para importar pizzas corretamente, o <strong>título da categoria deve conter a palavra "pizza"</strong> (ex: "Pizzas Doces", "Pizza Salgada")
                </li>
                <li>
                  O Anota AI não informa a quantidade de fatias, apenas os sabores. <strong>Você precisará configurar manualmente o número de fatias</strong> após a importação
                </li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert className="border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-500">
            <CircleAlert />
            <AlertTitle>Atenção aos preços:</AlertTitle>
            <AlertDescription className="text-amber-700/90 dark:text-amber-400/90">
              Todos os itens serão importados com o <strong>preço de domingo</strong> cadastrado no Anota AI.{" "}
              <strong>Revise e ajuste os preços antes de abrir o cardápio ao público!</strong>
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <Lock />
            <AlertTitle>Bloqueio de reimportação:</AlertTitle>
            <AlertDescription>
              Após a importação, o botão ficará <strong>inativo até que todas as categorias sejam removidas</strong> do cardápio. Isso evita problemas de duplicação e indexação dos itens.
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            className="flex items-center gap-2"
            disabled={!existeTokenAnotaai || processing}
            onClick={importarCardapio}
          >
            {processing ? <Spinner /> : <ArrowDownToLine />}
            {processing ? "Importando..." : "Iniciar importação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
