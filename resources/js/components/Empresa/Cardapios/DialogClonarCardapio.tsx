import { useState } from "react";
import { router, usePage } from "@inertiajs/react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  ClipboardCheck,
  Info,
  CheckCircle,
  AlertTriangle,
  FileStack,
} from "lucide-react";
import { ICardapio } from "@/types/cardapio-digital/cardapio";

const ITENS_CLONADOS = [
  "Todas as categorias do cardápio",
  "Todos os itens cadastrados",
  "Todos os grupos de complementos",
  "Todos os complementos vinculados",
];

export default function DialogClonarCardapio({
  open,
  onOpenChange,
  cardapio,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  cardapio?: ICardapio;
}) {
  const { cnpj } = usePage<{ cnpj: string }>().props;
  const [novoNomeCardapio, setNovoNomeCardapio] = useState("");
  const [processing, setProcessing] = useState(false);

  function clonarCardapio() {
    if (!cardapio || !novoNomeCardapio.trim()) return;

    setProcessing(true);
    router.post(
      route("aplicacao.empresa.cardapios.clone", {
        cnpj,
        cardapio_id: cardapio.id,
      }),
      { novoNomeCardapio: novoNomeCardapio },
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Cardápio clonado com sucesso");
          onOpenChange(false);
        },
        onError: (errors) => {
          toast.error(Object.values(errors)[0] ?? "Erro ao clonar cardápio");
        },
        onFinish: () => {
          setProcessing(false);
          setNovoNomeCardapio("");
        },
      }
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) setNovoNomeCardapio("");
      }}
    >
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/10">
            <ClipboardCheck className="h-8 w-8 text-amber-500" />
          </div>
          <DialogTitle>Deseja realmente clonar este cardápio?</DialogTitle>
          <DialogDescription>
            Esta ação irá criar uma cópia completa do cardápio selecionado.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
          <div className="flex items-start gap-3">
            <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium">O que será clonado:</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {ITENS_CLONADOS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <Field>
          <FieldLabel htmlFor="novoNomeCardapio">Nome do novo cardápio</FieldLabel>
          <Input
            id="novoNomeCardapio"
            placeholder="Ex: Cardápio - Cópia"
            value={novoNomeCardapio}
            onChange={(e) => setNovoNomeCardapio(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Informe o nome para identificar o cardápio clonado
          </p>
        </Field>

        <div className="flex items-start gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
          <p>
            <strong>Atenção:</strong> Esta operação pode levar alguns instantes
            dependendo da quantidade de itens.
          </p>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!novoNomeCardapio.trim() || processing}
            onClick={clonarCardapio}
          >
            <ClipboardCheck />
            {processing ? "Clonando..." : "Confirmar clonagem"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}