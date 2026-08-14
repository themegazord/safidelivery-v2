import { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Attachment, AttachmentMedia } from "@/components/ui/attachment";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";

export type TComplementoEdicao = {
    id: number
    nome: string
    descricao?: string
    imagem?: string
    preco: number
    status: boolean
    external_id?: number
}

type TDadosEdicaoComplemento = {
    nome: string
    descricao?: string
    imagem?: string
    preco: number
    status: boolean
    external_id?: number
}

interface IProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    complemento?: TComplementoEdicao
    cnpj: string
    cardapio_id: string
    categoria_id?: number
    onSubmit: (dados: TDadosEdicaoComplemento) => void
    loading: boolean
}

export default function EditarComplementoDialog({ open, onOpenChange, complemento, cnpj, cardapio_id, categoria_id, onSubmit, loading }: IProps) {
    const [nome, setNome] = useState('')
    const [descricao, setDescricao] = useState('')
    const [imagem, setImagem] = useState<string | undefined>(undefined)
    const [preco, setPreco] = useState(0)
    const [status, setStatus] = useState(true)
    const [externalId, setExternalId] = useState('')
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (!open || !complemento) return
        setNome(complemento.nome)
        setDescricao(complemento.descricao ?? '')
        setImagem(complemento.imagem)
        setPreco(complemento.preco)
        setStatus(complemento.status)
        setExternalId(complemento.external_id !== undefined ? String(complemento.external_id) : '')
    }, [open, complemento])

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file || !categoria_id) return

        setUploading(true)
        const imagemAnterior = imagem
        const formData = new FormData()
        formData.append('imagem', file)
        await axios.post(route('aplicacao.empresa.cardapios.categorias.item.store-imagem', { cnpj, cardapio_id, categoria_id }), formData)
            .then((response) => {
                setImagem(response.data.url)
                // Só apaga a imagem anterior se ela mesma ainda não tinha sido
                // vinculada ao complemento salvo (troca de imagem antes de salvar).
                if (imagemAnterior && imagemAnterior !== complemento?.imagem) {
                    axios.delete(route('aplicacao.empresa.cardapios.categorias.item.destroy-imagem', { cnpj, cardapio_id, categoria_id }), { data: { url: imagemAnterior } }).catch(() => {})
                }
            })
            .catch((error) => {
                toast.error(error.response?.data?.message ?? 'Erro inesperado, tente novamente.')
            })
            .finally(() => setUploading(false))
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Editar complemento</DialogTitle>
                    <DialogDescription>Atualize as informações do complemento "{complemento?.nome}".</DialogDescription>
                </DialogHeader>
                <FieldGroup>
                    <FieldGroup className="flex flex-row gap-4">
                        <Field className="md:w-fit md:shrink-0">
                            <FieldLabel>Imagem</FieldLabel>
                            <FieldLabel className="cursor-pointer">
                                <Attachment state={uploading ? 'uploading' : 'idle'} orientation={'vertical'} className="size-20">
                                    <AttachmentMedia variant={'image'}>
                                        {uploading ? (
                                            <Spinner />
                                        ) : (
                                            <img className="h-full w-full object-cover" src={imagem ?? 'https://placehold.co/80'} alt="Imagem do complemento" />
                                        )}
                                    </AttachmentMedia>
                                </Attachment>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleFileChange}
                                />
                            </FieldLabel>
                        </Field>
                        <Field className="flex-1">
                            <FieldLabel htmlFor="editar_complemento_nome">Nome</FieldLabel>
                            <Input
                                id="editar_complemento_nome"
                                name="editar_complemento_nome"
                                value={nome}
                                onInput={(e) => setNome(e.currentTarget.value)}
                            />
                            <FieldLabel htmlFor="editar_complemento_descricao" className="mt-2">Descrição</FieldLabel>
                            <Textarea
                                id="editar_complemento_descricao"
                                name="editar_complemento_descricao"
                                className="h-20 resize-none field-sizing-fixed"
                                value={descricao}
                                onInput={(e) => setDescricao(e.currentTarget.value)}
                            />
                        </Field>
                    </FieldGroup>
                    <FieldGroup className="flex flex-col md:grid md:grid-cols-2 gap-4">
                        <Field>
                            <FieldLabel htmlFor="editar_complemento_preco">Preço</FieldLabel>
                            <InputGroup>
                                <InputGroupAddon>R$</InputGroupAddon>
                                <InputGroupInput
                                    key={preco}
                                    id="editar_complemento_preco"
                                    name="editar_complemento_preco"
                                    type="number"
                                    min={0}
                                    step={0.01}
                                    defaultValue={preco}
                                    onBlur={(e) => setPreco(e.currentTarget.value === '' ? 0 : Number(e.currentTarget.value))}
                                />
                            </InputGroup>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="editar_complemento_external_id">Código PDV</FieldLabel>
                            <Input
                                id="editar_complemento_external_id"
                                name="editar_complemento_external_id"
                                value={externalId}
                                onInput={(e) => setExternalId(e.currentTarget.value)}
                            />
                        </Field>
                    </FieldGroup>
                    <Field className="flex flex-row items-center justify-between">
                        <Label htmlFor="editar_complemento_status">Complemento ativo</Label>
                        <Switch id="editar_complemento_status" checked={status} onCheckedChange={setStatus} />
                    </Field>
                </FieldGroup>
                <DialogFooter className="flex flex-row-reverse gap-4">
                    <Button
                        onClick={() => onSubmit({
                            nome,
                            descricao,
                            imagem,
                            preco,
                            status,
                            external_id: externalId ? Number(externalId) : undefined,
                        })}
                        disabled={loading || !nome || uploading}
                    >
                        {loading ? <><Spinner /> Salvando...</> : 'Salvar'}
                    </Button>
                    <DialogClose render={<Button variant={'outline'} />}>Cancelar</DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
