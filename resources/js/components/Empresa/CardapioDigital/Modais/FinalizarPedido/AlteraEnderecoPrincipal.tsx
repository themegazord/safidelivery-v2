import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { IAuth, IEndereco } from "@/types/usuario-autenticado/usuario";
import { router } from "@inertiajs/react";
import axios from "axios";
import { useState } from "react";
import { toast } from "sonner";

interface IProps {
  open: boolean,
  setOpen: (val: boolean) => void,
  auth?: IAuth
}

export default function AlteraEnderecoPrincipal({
  open,
  setOpen,
  auth
}: IProps) {

  const enderecoPrincipal = auth?.user?.cliente.enderecos.find(endereco => Boolean(endereco.pivot.principal) === true) ?? auth?.user?.cliente.enderecos[0]

  const [enderecoAtivo, setEnderecoAtivo] = useState<string>(enderecoPrincipal ? String(enderecoPrincipal.id) : '')

  function atualizaEnderecoPrincipal() {
    axios.patch(route('aplicacao.empresa.finalizar-pedido.altera-endereco-principal'), {
      cliente_id: auth?.user?.cliente.id,
      novo_endereco_principal_id: Number(enderecoAtivo)
    }).then((response) => {
      toast.success(response.data.mensagem, {position: 'top-right'})
      router.reload({only: ['auth']})
      setOpen(false)
    }).catch((response) => {
      console.error(response.data.error)
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Selecione o endereço de entrega</DialogTitle>
        </DialogHeader>
        <RadioGroup onValueChange={(value) => setEnderecoAtivo(value)} defaultValue={enderecoAtivo}>
          {auth?.user?.cliente.enderecos.map(endereco => (
            <FieldLabel htmlFor={String(endereco.id)} key={endereco.id}>
              <Field orientation={'horizontal'}>
                <FieldContent>
                  <FieldTitle>{endereco.logradouro},{endereco.numero}</FieldTitle>
                  <FieldDescription>{endereco.bairro} - {endereco.cidade}/{endereco.uf}</FieldDescription>
                  <FieldDescription className="text-xs">{endereco.complemento}</FieldDescription>
                </FieldContent>
                <RadioGroupItem value={String(endereco.id)} id={String(endereco.id)} />
              </Field>
            </FieldLabel>
          ))}
        </RadioGroup>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant={'destructive'} className="cursor-pointer">Fechar</Button>
          </DialogClose>
          <Button className="cursor-pointer" onClick={() => atualizaEnderecoPrincipal()}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}