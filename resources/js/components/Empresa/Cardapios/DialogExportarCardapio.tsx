import { usePage } from "@inertiajs/react";
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
import { FileDown, FileText } from "lucide-react";
import { ICardapio } from "@/types/cardapio-digital/cardapio";

export default function DialogExportarCardapio({
  open,
  onOpenChange,
  cardapio,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  cardapio?: ICardapio;
}) {
  const { cnpj } = usePage<{ cnpj: string }>().props;

  function exportar(tipo: "pdf") {
    if (!cardapio) return;

    window.open(
      route("aplicacao.empresa.cardapios.export", {
        cnpj,
        cardapio_id: cardapio.id,
        tipo,
      }),
      "_blank"
    );

    toast.success("Exportação iniciada");
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="items-center text-center">
          <div className="mb-2 flex h-16 w-16 items-center justify-center rounded-full bg-blue-500/10">
            <FileDown className="h-8 w-8 text-blue-500" />
          </div>
          <DialogTitle>Exportar cardápio</DialogTitle>
          <DialogDescription>
            {cardapio
              ? `Escolha o formato para exportar "${cardapio.nome}".`
              : "Escolha o formato de exportação."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-2">
          <Button
            variant="outline"
            className="flex items-center justify-start gap-2"
            onClick={() => exportar("pdf")}
          >
            <FileText className="h-4 w-4" />
            Exportar como PDF
          </Button>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}