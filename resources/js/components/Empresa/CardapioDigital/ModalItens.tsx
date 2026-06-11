import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { H4, H6 } from "@/components/utils/Heading";
import { IItemPedido } from "@/types/cardapio-digital/item-pedido";
import { Minus, Plus } from "lucide-react";

interface IProps {
    item?: IItemPedido
    open: boolean
    setOpen: (valor: boolean) => void,
    adicionaQtde: (alvo: 'item' | 'complemento', grupo_idx?: number, complemento_idx?: number) => void
    diminuiQtde: (alvo: 'item' | 'complemento', grupo_idx?: number, complemento_idx?: number) => void
    adicionaObservacao: (observacao: string) => void
}

export default function ModalItens({ item, open, setOpen, adicionaQtde, diminuiQtde, adicionaObservacao }: IProps) {
    function converteReal(valor?: number | string) {
        return Number(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })
    }
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="w-11/12 md:max-w-5xl flex flex-col max-h-[90dvh] md:max-h-none md:block overflow-hidden md:overflow-visible" aria-describedby={undefined}>
                <DialogHeader className="shrink-0 md:shrink">
                    <DialogTitle>{item?.nome}</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:grid md:grid-cols-2 gap-6 flex-1 md:flex-none min-h-0 md:min-h-fit my-4">
                    <div className="flex h-48 md:h-96 w-full items-center justify-center overflow-hidden shrink-0">
                        <img src={item?.imagem} alt={`Imagem do produto ${item?.nome}`} className="w-full object-cover rounded-xl h-full" />
                    </div>
                    <div className="flex-1 min-h-0 overflow-y-auto md:max-h-96 w-full space-y-4 pb-2 pr-1">
                        {(item?.descricao.trim().length ?? 0 > 0) && (
                            <div className="flex flex-col gap-2">
                                <p className="text-sm">Descrição do item:</p>
                                <p className="text-foreground mb-4">{item?.descricao}</p>
                            </div>
                        )}
                        <div className="mb-4">
                            {Boolean(item?.desconto) ? (
                                <span className="flex gap-2 items-center">
                                    <H4 className="text-green-500 font-bold">R$ {converteReal(item?.valor_desconto)}</H4>
                                    <H6 className="text-gray-400 line-through">R$ {converteReal(item?.preco)}</H6>
                                    <Badge className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                                        Desconto
                                    </Badge>
                                </span>
                            ) : (
                                <H4 className="text-green-500 font-bold">R$ {converteReal(item?.preco)}</H4>
                            )}
                        </div>
                        {item?.grupo_complemento.map((grupo, grupoIdx) => (
                            <Card className="w-full mb-4" key={grupoIdx}>
                                <CardHeader>
                                    <div className="flex justify-between items-center">
                                        <CardTitle>{grupo.nome}</CardTitle>
                                        {Boolean(grupo.obrigatoriedade) ? (
                                            <Badge className="bg-red-50 text-red-700 dark:bg-red-950 dark:text-red-300">
                                                Obrigatório
                                            </Badge>
                                        ) : (
                                            <Badge className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                                                Opcional
                                            </Badge>
                                        )}
                                    </div>
                                    <CardDescription>{`Escolha ${Boolean(grupo.obrigatoriedade) ? 'até' : ''} ${grupo.qtd_maxima > 1 ? grupo.qtd_maxima + ' opções' : grupo.qtd_maxima + ' opção'} `}</CardDescription>
                                </CardHeader>
                                <Separator />
                                <CardContent>
                                    {grupo.complementos.map((complemento, cIdx) => (
                                        <div className="flex items-center justify-between rounded-lg p-2 hover:bg-background/20 mb-2" key={cIdx}>
                                            <div>
                                                <p className="font-medium">{complemento.nome}</p>
                                                <p className="text-sm font-bold text-foreground">+ R$ {converteReal(complemento.preco)}</p>
                                            </div>
                                            <ButtonGroup className="max-w-1/2 md:max-w-2/7">
                                                <Button className="cursor-pointer" disabled={complemento.quantidade === 0} onClick={() => diminuiQtde('complemento', grupoIdx, cIdx)}><Minus /></Button>
                                                <Input className="text-center" value={complemento.quantidade} disabled />
                                                <Button className="cursor-pointer" disabled={Boolean(grupo.bloqueado)} onClick={() => adicionaQtde('complemento', grupoIdx, cIdx)}><Plus /></Button>
                                            </ButtonGroup>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                        <Field>
                            <FieldLabel htmlFor="observacao">Observação do pedido (opcional): </FieldLabel>
                            <Textarea id="observacao" name="observacao" value={item?.observacao} onChange={(e) => adicionaObservacao(e.target.value)} />
                        </Field>
                    </div>
                </div>
                <DialogFooter>
                    <div className="flex flex-col items-center justify-between gap-4 md:flex-row w-full">
                        <div className="flex items-center gap-3">
                            <p className="font-semibold">Quantidade:</p>
                            <ButtonGroup className="w-full md:max-w-2/7">
                                <Button className="cursor-pointer" disabled={item?.quantidade === 1} onClick={() => diminuiQtde('item')}><Minus /></Button>
                                <Input className="text-center" value={item?.quantidade} disabled />
                                <Button className="cursor-pointer" onClick={() => adicionaQtde('item')}><Plus /></Button>
                            </ButtonGroup>
                        </div>
                        <Button className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 hover:bg-green-50/20 dark:hover:bg-green-950/20 cursor-pointer w-full md:w-auto">
                            Adicionar <Plus />
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
