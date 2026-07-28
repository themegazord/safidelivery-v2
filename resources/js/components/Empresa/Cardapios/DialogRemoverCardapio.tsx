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
  Trash,
  FileText,
  AlertTriangle,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { ICardapio } from "@/types/cardapio-digital/cardapio";

const TEXTO_CONFIRMACAO = "REMOVER";

const ITENS_REMOVIDOS = [
  "Todas as categorias vinculadas",
  "Todos os itens do cardápio",
  "Todos os grupos de complementos",
  "Todos os complementos cadastrados",
  "Todos os relacionamentos e configurações",
];

export default function DialogRemoverCardapio({
  open,
  onOpenChange,
  cardapio,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  cardapio?: ICardapio;
}) {
  const { cnpj } = usePage<{ cnpj: string }>().props;
  const [confirmationText, setConfirmationText] = useState("");
  const [processing, setProcessing] = useState(false);

  const podeRemover = confirmationText === TEXTO_CONFIRMACAO;

  function removerCardapio() {
    if (!cardapio || !podeRemover) return;

    setProcessing(true);
    router.delete(
      route("aplicacao.empresa.cardapios.destroy", {
        cnpj,
        cardapio_id: cardapio.id,
      }),
      {
        preserveScroll: true,
        onSuccess: () => {
          toast.success("Cardápio removido com sucesso");
          onOpenChange(false);
        },
        onError: (errors) => {
          toast.error(Object.values(errors)[0] ?? "Erro ao remover cardápio");
        },
        onFinish: () => {
          setProcessing(false);
          setConfirmationText("");
        },
      }
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        onOpenChange(value);
        if (!value) setConfirmationText("");
      }}
    >
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <Trash className="h-8 w-8 text-destructive" />
          </div>
          <DialogTitle>Tem certeza que deseja remover este cardápio?</DialogTitle>
          <DialogDescription>
            Esta ação é <strong className="text-destructive">irreversível</strong> e não poderá ser desfeita.
          </DialogDescription>
        </DialogHeader>

        {cardapio && (
          <div className="flex items-center gap-3 rounded-lg border bg-muted/50 p-4">
            <FileText className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Cardápio</p>
              <p className="font-semibold">{cardapio.nome ?? "Não informado"}</p>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div className="flex-1">
              <p className="mb-2 text-sm font-medium">
                Dados que serão removidos permanentemente:
              </p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                {ITENS_REMOVIDOS.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 p-3 text-sm">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p>
            <strong>Atenção:</strong> Todos os dados relacionados serão perdidos
            permanentemente. Esta ação não pode ser desfeita.
          </p>
        </div>

        <Field>
          <FieldLabel htmlFor="confirmationText">
            Digite &apos;{TEXTO_CONFIRMACAO}&apos; para confirmar
          </FieldLabel>
          <Input
            id="confirmationText"
            placeholder={TEXTO_CONFIRMACAO}
            value={confirmationText}
            onChange={(e) => setConfirmationText(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Esta confirmação adicional previne exclusões acidentais
          </p>
        </Field>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            disabled={!podeRemover || processing}
            onClick={removerCardapio}
          >
            <Trash />
            {processing ? "Removendo..." : "Remover cardápio"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}