import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Minus, Plus } from "lucide-react";

export type TGrupoComplementoEdicao = {
    id: number
    nome: string
    obrigatoriedade: boolean
    qtd_minima: number
    qtd_maxima: number
}

type TDadosEdicaoGrupo = Pick<TGrupoComplementoEdicao, 'nome' | 'obrigatoriedade' | 'qtd_minima' | 'qtd_maxima'>

interface IProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    grupo?: TGrupoComplementoEdicao
    onSubmit: (dados: TDadosEdicaoGrupo) => void
    loading: boolean
}

const OPCOES_OBRIGATORIEDADE = [
    { value: true, label: 'Obrigatório' },
    { value: false, label: 'Opcional' },
] as const

export default function EditarGrupoComplementoDialog({ open, onOpenChange, grupo, onSubmit, loading }: IProps) {
    const [nome, setNome] = useState('')
    const [obrigatoriedade, setObrigatoriedade] = useState(false)
    const [qtdMinima, setQtdMinima] = useState(0)
    const [qtdMaxima, setQtdMaxima] = useState(1)

    useEffect(() => {
        if (!open || !grupo) return
        setNome(grupo.nome)
        setObrigatoriedade(grupo.obrigatoriedade)
        setQtdMinima(grupo.qtd_minima)
        setQtdMaxima(grupo.qtd_maxima)
    }, [open, grupo])

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar grupo de complementos</DialogTitle>
                    <DialogDescription>Atualize as informações gerais do grupo "{grupo?.nome}".</DialogDescription>
                </DialogHeader>
                <FieldGroup>
                    <Field>
                        <FieldLabel htmlFor="editar_grupo_nome">Nome do grupo</FieldLabel>
                        <Input
                            id="editar_grupo_nome"
                            name="editar_grupo_nome"
                            value={nome}
                            onInput={(e) => setNome(e.currentTarget.value)}
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="editar_grupo_obrigatoriedade">Este grupo é obrigatório ou opcional?</Label>
                        <Select
                            id="editar_grupo_obrigatoriedade"
                            name="editar_grupo_obrigatoriedade"
                            items={OPCOES_OBRIGATORIEDADE}
                            value={obrigatoriedade}
                            onValueChange={(e) => setObrigatoriedade(e as boolean)}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {OPCOES_OBRIGATORIEDADE.map((opcao, opcaoIdx) => (
                                    <SelectItem key={opcaoIdx} value={opcao.value}>{opcao.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </Field>
                    <FieldGroup className="grid grid-cols-2 gap-4">
                        <Field>
                            <Label htmlFor="editar_grupo_qtd_minima">Qtd. mínima</Label>
                            <InputGroup>
                                <InputGroupButton onClick={() => setQtdMinima((v) => Math.max(0, v - 1))}><Minus /></InputGroupButton>
                                <InputGroupInput
                                    id="editar_grupo_qtd_minima"
                                    className="text-center"
                                    value={qtdMinima}
                                    type="number"
                                    readOnly
                                />
                                <InputGroupButton onClick={() => setQtdMinima((v) => v + 1)}><Plus /></InputGroupButton>
                            </InputGroup>
                        </Field>
                        <Field>
                            <Label htmlFor="editar_grupo_qtd_maxima">Qtd. máxima</Label>
                            <InputGroup>
                                <InputGroupButton onClick={() => setQtdMaxima((v) => Math.max(1, v - 1))}><Minus /></InputGroupButton>
                                <InputGroupInput
                                    id="editar_grupo_qtd_maxima"
                                    className="text-center"
                                    value={qtdMaxima}
                                    type="number"
                                    readOnly
                                />
                                <InputGroupButton onClick={() => setQtdMaxima((v) => v + 1)}><Plus /></InputGroupButton>
                            </InputGroup>
                        </Field>
                    </FieldGroup>
                </FieldGroup>
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <Button
                        onClick={() => onSubmit({ nome, obrigatoriedade, qtd_minima: qtdMinima, qtd_maxima: qtdMaxima })}
                        disabled={loading || !nome}
                    >
                        {loading ? <><Spinner /> Salvando...</> : 'Salvar'}
                    </Button>
                    <DialogClose render={<Button variant={'outline'} />}>Cancelar</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
