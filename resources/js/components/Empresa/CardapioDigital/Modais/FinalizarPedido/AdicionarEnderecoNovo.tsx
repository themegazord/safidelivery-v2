import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";
import type { MaskitoOptions } from "@maskito/core";
import { useMaskito } from "@maskito/react";
import { Input } from "@/components/ui/input";
import { Form, router, useForm } from "@inertiajs/react";
import { Button } from "@/components/ui/button";
import { consultaCEP } from "@/utils/utils";
import { toast } from "sonner";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { useState } from "react";
import { Globe, Hash, House, Loader, Map, MapPin, Store } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ESTADOS } from "@/utils/estados";
import axios from "axios";

interface IProps {
    open: boolean;
    setOpen: (val: boolean) => void;
}

const CEPMask: MaskitoOptions = {
  mask: [
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    '-',
    /\d/,
    /\d/,
    /\d/
  ]
}

export default function AdicionarEnderecoNovo({ open, setOpen }: IProps) {
    const [loadingViaCEP, setLoadingViaCEP] = useState(false)
    const form = useForm<{
      cep: string,
      logradouro: string,
      numero: string,
      complemento: string,
      bairro: string,
      cidade: string,
      uf: string | null
    }>({
      cep: "",
      logradouro: "",
      numero: "",
      complemento: "",
      bairro: "",
      cidade: "",
      uf: ""
    })

    const CEPMaskRef = useMaskito({options: CEPMask})

    async function consultaViaCEP() {
      form.clearErrors();
      try {
        setLoadingViaCEP(true)
        if (limpaCEP().trim().length !== 8) {
          form.setError('cep', 'Por favor, informe um CEP válido, com 8 digitos.')
          return
        }
        const endereco = await consultaCEP(form.data.cep.replace(/[^0-9]/g, ''));
        if (!endereco) {
            form.setError('cep', 'CEP informado é inválido ou está desatualizado no cadastro do IBGE')
            return;
        }
        form.setData({
          cep: form.data.cep,
          ...endereco
        })
      } finally {
        setLoadingViaCEP(false)
      }
    }

    async function cadastrarEndereco() {
      form.data.cep = limpaCEP();
      await axios.post(route('aplicacao.empresa.finalizar-pedido.cadastra-novo-endereco'), {...form.data})
        .then((response) => {
          toast.success(response.data.mensagem, {position: 'top-right'})
          router.reload({only: ['auth']})
          setOpen(false)
          form.resetAndClearErrors();
        })
        .catch((error) => {
          if (error.response?.status === 422) {
            form.setError(error.response.data.errors)
          }
        })
    }

    const limpaCEP = (): string => form.data.cep.replace(/[^0-9]/g, ''); 

    return (
        <Dialog open={open} onOpenChange={setOpen}>
          <Form action='#' method="post">
            <DialogContent className="sm:max-w-2xl" aria-describedby={undefined}>
              <DialogHeader className="sr-only">
                <DialogTitle></DialogTitle>
              </DialogHeader>
                <FieldSet className="w-full max-w-2xl">
                  <FieldLegend>Informações do endereço</FieldLegend>
                  <FieldDescription>
                    Nós precisamos dos dados do seu endereço para entregar seu pedido.
                  </FieldDescription>
                  <FieldGroup>
                      <Field data-invalid={!!form.errors.cep}>
                        <FieldLabel htmlFor="cep">CEP</FieldLabel>
                        <InputGroup>
                          <InputGroupInput aria-invalid={!!form.errors.cep} ref={CEPMaskRef} placeholder="00000-000" name="cep" id="cep" onBlur={(e) => form.setData('cep', e.currentTarget.value)} />
                          <InputGroupAddon align={'inline-end'}>
                            <InputGroupButton className="cursor-pointer" onClick={() => consultaViaCEP()}>{loadingViaCEP ? <Loader className="animate-spin" /> : 'Buscar'}</InputGroupButton>
                          </InputGroupAddon>
                          <InputGroupAddon>
                            <MapPin />
                          </InputGroupAddon>
                        </InputGroup>
                        {!!form.errors.cep && (
                          <FieldError>{form.errors.cep}</FieldError>
                        )}
                      </Field>
                      <Field data-invalid={!!form.errors.logradouro}>
                        <FieldLabel htmlFor="logradouro">Logradouro</FieldLabel>
                        <InputGroup>
                          <InputGroupInput defaultValue={form.data.logradouro} aria-invalid={!!form.errors.logradouro}/>
                          <InputGroupAddon>
                            <House />
                          </InputGroupAddon>
                        </InputGroup>
                        {!!form.errors.logradouro && (
                          <FieldError>{form.errors.logradouro}</FieldError>
                        )}
                      </Field>
                      <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                        <Field data-invalid={!!form.errors.numero}>
                          <FieldLabel htmlFor="numero">Número</FieldLabel>
                          <InputGroup>
                            <InputGroupInput
                              value={form.data.numero}
                              onChange={(e) => form.setData('numero', e.currentTarget.value)}
                              aria-invalid={!!form.errors.numero}
                            />
                            <InputGroupAddon>
                              <Hash />
                            </InputGroupAddon>
                          </InputGroup>
                          {!!form.errors.numero && (
                            <FieldError>{form.errors.numero}</FieldError>
                          )}
                        </Field>
                        <Field data-invalid={!!form.errors.complemento}>
                          <FieldLabel htmlFor="complemento">Complemento</FieldLabel>
                          <InputGroup>
                            <InputGroupInput defaultValue={form.data.complemento} aria-invalid={!!form.errors.complemento}/>
                          </InputGroup>
                          {!!form.errors.complemento && (
                            <FieldError>{form.errors.complemento}</FieldError>
                          )}
                        </Field>
                      </div>
                      <Field data-invalid={!!form.errors.bairro}>
                        <FieldLabel htmlFor="bairro">Bairro</FieldLabel>
                        <InputGroup>
                          <InputGroupInput defaultValue={form.data.bairro} aria-invalid={!!form.errors.bairro}/>
                          <InputGroupAddon>
                            <Map />
                          </InputGroupAddon>
                        </InputGroup>
                        {!!form.errors.bairro && (
                          <FieldError>{form.errors.bairro}</FieldError>
                        )}
                      </Field>
                      <div className="flex flex-col md:grid md:grid-cols-2 gap-4">
                        <Field data-invalid={!!form.errors.cidade}>
                          <FieldLabel htmlFor="cidade">Cidade</FieldLabel>
                          <InputGroup>
                            <InputGroupInput defaultValue={form.data.cidade} aria-invalid={!!form.errors.cidade}/>
                            <InputGroupAddon>
                              <Store />
                            </InputGroupAddon>
                          </InputGroup>
                          {!!form.errors.cidade && (
                            <FieldError>{form.errors.cidade}</FieldError>
                          )}
                        </Field>
                        <Field data-invalid={!!form.errors.uf}>
                          <FieldLabel htmlFor="uf">UF</FieldLabel>
                          <InputGroup>
                            <Select value={form.data.uf ?? undefined} onValueChange={(value) => form.setData('uf', value)} aria-invalid={!!form.errors.uf}>
                              <SelectTrigger id="uf" aria-invalid={!!form.errors.uf} className="w-full">
                                <SelectValue placeholder="Selecione um estado..." />
                              </SelectTrigger>
                              <SelectContent>
                                {ESTADOS.filter((estado) => estado.value !== null).map(({ value, label }, idx) => (
                                  <SelectItem key={idx} value={value as string}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </InputGroup>
                          {!!form.errors.uf && (
                            <FieldError>{form.errors.uf}</FieldError>
                          )}
                        </Field>
                      </div>
                  </FieldGroup>
                </FieldSet>
                <DialogFooter>
                  <DialogClose render={<Button type="button" variant={'destructive'} className="cursor-pointer" />}>
                    Fechar
                  </DialogClose>
                  <Button className="cursor-pointer" onClick={() => cadastrarEndereco()}>Salvar</Button>
                </DialogFooter>
            </DialogContent>
          </Form>
        </Dialog>
    );
}
