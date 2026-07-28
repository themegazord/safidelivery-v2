import { Button } from "@/components/ui/button";
import { Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty, ComboboxItem, ComboboxList, ComboboxValue } from "@/components/ui/combobox";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerFooter, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { useForm, usePage } from "@inertiajs/react";
import { useEffect } from "react";
import { toast } from "sonner";

const DIAS_SEMANA = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Segunda-feira' },
  { value: 2, label: 'Terça-feira' },
  { value: 3, label: 'Quarta-feira' },
  { value: 4, label: 'Quinta-feira' },
  { value: 5, label: 'Sexta-feira' },
  { value: 6, label: 'Sábado' },
] as const

const TIPO_FUNCIONAMENTO = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'mesa', label: 'Atendimento em mesa' },
] as const 

const DIA_SEMANA = (value: number) => DIAS_SEMANA.filter(ds => ds.value === value)[0].label 

type TDiasSemana = typeof DIAS_SEMANA
type TDiaSemana = {value: number, label: string}

export default function DrawerCUCardapio({dados, open, onOpenChange, mode}: {
  dados: any,
  open: boolean,
  mode: 'create' | 'update'
  onOpenChange: (value: boolean) => void
}) {
  const { cnpj } = usePage<{cnpj: string}>().props

  const INFO_CREATE = (mode: string) => {
    if (mode === 'create') {
      return {
        title: 'Novo cardápio',
        description: 'Preencha as informações abaixo para criar um novo cardápio.'
      }
    }

    if (mode === 'update') {
      return {
        title: 'Editar cardápio',
        description: 'Atualize as informações do cardápio selecionado.'
      }
    }
  }

  const { data, setData, post, put, processing, errors, resetAndClearErrors } = useForm<{
    id?: number,
    empresa_id?: number,
    nome: string,
    descricao: string,
    dias_funcionamento: Array<number | string>
    tipo_funcionamento?: 'delivery' | 'mesa'
  }>({
    id: undefined,
    empresa_id: undefined,
    nome: '',
    descricao: '',
    dias_funcionamento: [],
    tipo_funcionamento: undefined 
  })

  useEffect(() => {
    if (!open) return

    if (mode === 'update' && dados) {
      setData({
        id: dados.id,
        empresa_id: dados.empresa_id,
        nome: dados.nome ?? '',
        descricao: dados.descricao ?? '',
        dias_funcionamento: dados.dias_funcionamento ?? [],
        tipo_funcionamento: dados.tipo_funcionamento ?? undefined,
      })
    } else {
      resetAndClearErrors()
    }
  }, [open, mode, dados])

  const TEXTO_BOTAO = mode === 'create'
    ? (processing ? 'Cadastrando...' : 'Cadastrar')
    : (processing ? 'Salvando...' : 'Salvar')

  function upsertCardapio(e: React.SubmitEvent) {
    e.preventDefault()

    if (mode === 'create') {
      post(route('aplicacao.empresa.cardapios.store', {cnpj}), {
        onSuccess: () => {
          toast.success('Cardápio cadastrado com sucesso')
          resetAndClearErrors()
          onOpenChange(false)
        }
      })
    } else {
      put(route('aplicacao.empresa.cardapios.update', {cnpj, cardapio_id: dados.id}), {
        onSuccess: () => {
          toast.success('Cardápio atualizado com sucesso')
          onOpenChange(false)
        },
        onError: (errors) => {
          toast.error(Object.values(errors)[0] ?? 'Erro ao atualizar cardápio')
        }
      })
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange} direction="right">
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>{INFO_CREATE(mode)?.title}</DrawerTitle>
          <DrawerDescription>{INFO_CREATE(mode)?.description}</DrawerDescription>
        </DrawerHeader>
        <form id="form-cardapio" onSubmit={upsertCardapio}>
          <div className="flex-1 overflow-y-auto px-4">
            <FieldGroup>
              <Field data-invalid={!!errors.nome}>
                <FieldLabel htmlFor="nome">Nome do cardápio</FieldLabel>
                <Input
                  name="nome"
                  id="nome"
                  value={data.nome}
                  onChange={(e) => setData('nome', e.target.value)}
                  aria-invalid={!!errors.nome}
                />
                <FieldError>{errors.nome}</FieldError>
              </Field>
              <Field data-invalid={!!errors.descricao}>
                <FieldLabel htmlFor="descricao">Descrição do cardápio</FieldLabel>
                  <Textarea
                    name="descricao"
                    id="descricao"
                    value={data.descricao}
                    onChange={(e) => setData('descricao', e.target.value)}
                    aria-invalid={!!errors.descricao}
                  />
                  <FieldError>{errors.descricao}</FieldError>
              </Field>
              <Field data-invalid={!!errors.dias_funcionamento}>
                <FieldLabel htmlFor="dias_funcionamento">Dias de funcionamento</FieldLabel>
                <Combobox
                  name="dias_funcionamento"
                  id="dias_funcionamento"
                  items={DIAS_SEMANA}
                  multiple
                  autoHighlight
                  itemToStringValue={(item: TDiaSemana) => item.label}
                  value={DIAS_SEMANA.filter(ds => data.dias_funcionamento.includes(ds.value))}
                  onValueChange={(itens: TDiaSemana[]) =>
                    setData('dias_funcionamento', itens.map(i => i.value))
                  }
                  data-invalid={!!errors.dias_funcionamento}
                >
                  <ComboboxChips>
                    <ComboboxValue>
                      {data.dias_funcionamento.map(df => (
                        <ComboboxChip key={df}>{DIA_SEMANA(Number(df))}</ComboboxChip>
                      ))}
                      <ComboboxChipsInput aria-invalid={!!errors.dias_funcionamento}/>
                    </ComboboxValue>
                  </ComboboxChips>
                  <ComboboxContent>
                    <ComboboxEmpty>Não contêm dias a ser informado</ComboboxEmpty>
                    <ComboboxList>
                      {(item: TDiaSemana) => (
                        <ComboboxItem key={item.value} value={item}>{item.label}</ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>
                <FieldError>{errors.dias_funcionamento}</FieldError>
              </Field>
              <Field data-invalid={!!errors.tipo_funcionamento}>
                <FieldLabel>Tipo de funcionamento</FieldLabel>
                <Select value={data.tipo_funcionamento} onValueChange={(e: 'delivery' | 'mesa') => setData('tipo_funcionamento', e)}>
                  <SelectTrigger aria-invalid={!!errors.tipo_funcionamento}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Tipo de funcionamento</SelectLabel>
                      {TIPO_FUNCIONAMENTO.map(tp => (
                        <SelectItem key={tp.value} value={tp.value}>{tp.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.tipo_funcionamento}</FieldError>
              </Field>
            </FieldGroup>
          </div>
        </form>
        <DrawerFooter className="flex flex-row-reverse">
            <Button className="flex items-center gap-2" type="submit" form="form-cardapio">
              {processing && <Spinner />}
              {TEXTO_BOTAO}
            </Button>
            <DrawerClose asChild>
              <Button variant={"destructive"}>Fechar</Button>
            </DrawerClose>
          </DrawerFooter>
      </DrawerContent>
    </Drawer>
  )
}