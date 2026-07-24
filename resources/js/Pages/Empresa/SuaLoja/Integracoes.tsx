import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LayoutAutenticado from "@/Layouts/LayoutsAutenticado";
import { IIntegracao } from "@/types/empresa/sua-loja/types";
import { usePage } from "@inertiajs/react";
import axios from "axios";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function Integracoes() {
  const { cnpj, integracoes } = usePage<{cnpj: string, integracoes: IIntegracao[]}>().props

  const TABS = [
    {value: 'safi', label: 'SAFI'},
    {value: 'pagarme', label: 'Pagar.me'},
    {value: 'ifood', label: 'IFOOD'},
    {value: 'anotaai', label: 'Anota.ai'},
  ]

  const [integracaoSAFI, setIntegracaoSAFI] = useState<IIntegracao>()
  const [integracaoPagarme, setIntegracaoPagarme] = useState<IIntegracao>()
  const [integracaoIFOOD, setIntegracaoIFOOD] = useState<IIntegracao>()
  const [integracaoAnotaai, setIntegracaoAnotaai] = useState<IIntegracao>()
  const [loading, setLoading] = useState<boolean>(false)
  const [saving, setSaving] = useState<boolean>(false)

  useEffect(() => {
    setIntegracaoSAFI(integracoes.filter(integracao => integracao.tipo === 'safi')[0])
    setIntegracaoPagarme(integracoes.filter(integracao => integracao.tipo === 'pagarme')[0])
    setIntegracaoIFOOD(integracoes.filter(integracao => integracao.tipo === 'ifood')[0])
    setIntegracaoAnotaai(integracoes.filter(integracao => integracao.tipo === 'anotaai')[0])
  }, [])

  async function solicitaCompanyTokenBackend() {
    setLoading(true)
    await axios.get(route('aplicacao.empresa.configempresa.integracoes.safi.gera-company-token', {cnpj: cnpj}))
      .then((response) => {
        setIntegracaoSAFI(prev => ({
          ...prev!,
          companyToken: response.data.companyToken,
        }));
      })
      .finally(() => setLoading(false))
  }

  async function salvarSAFI() {
    setSaving(true)
    await axios.post(route('aplicacao.empresa.configempresa.integracoes.update', {cnpj: cnpj}), {
      cnpj: cnpj,
      integracao: {
        tipo: 'safi',
        companyToken: integracaoSAFI?.companyToken,
      }
    })
      .then((response) => {
        setIntegracaoSAFI(response.data.integracao)
        toast.success(response.data.mensagem)
      })
      .catch((error) => {
        toast.error(error.response?.data.message)
      })
      .finally(() => setSaving(false))
  }

  async function salvarPagarme() {
    setSaving(true)
    await axios.post(route('aplicacao.empresa.configempresa.integracoes.update', {cnpj: cnpj}), {
      cnpj: cnpj,
      integracao: {
        tipo: 'pagarme',
        chavesecreta_pagarme: integracaoPagarme?.chavesecreta_pagarme,
      }
    })
      .then((response) => {
        setIntegracaoPagarme(response.data.integracao)
        toast.success(response.data.mensagem)
      })
      .catch((error) => {
        toast.error(error.response?.data.message)
      })
      .finally(() => setSaving(false))
  }

  return (
    <LayoutAutenticado>
      <Card>
        <CardHeader>
          <CardTitle>Configurar integrações</CardTitle>
          <CardDescription>Conecte o SAFI Delivery a serviços externos e gerencie as credenciais de cada conexão.</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="safi">
            <TabsList>
              {TABS.map((tab) => (
                <TabsTrigger value={tab.value} key={tab.value}>{tab.label}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="safi" className="pb-4">
              <Card>
                <CardContent>
                  <Field>
                    <FieldLabel>Company Token</FieldLabel>
                    <Input value={integracaoSAFI?.companyToken ?? undefined} readOnly />
                  </Field>
                </CardContent>
                <CardFooter className="flex flex-row-reverse gap-4">
                  <Button variant="default" onClick={salvarSAFI} disabled={saving || !integracaoSAFI?.companyToken}>
                    {saving ? <><Spinner /> Salvando...</> : 'Salvar'}
                  </Button>
                  <Button variant={"outline"} type="button" onClick={solicitaCompanyTokenBackend} disabled={loading || (integracaoSAFI?.companyToken?.length ?? 0) > 0}>
                    {loading ? <><Spinner /> Gerando...</> : 'Gerar Company Token'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="pagarme" className="pb-4">
              <Card>
                <CardContent>
                  <FieldGroup className="flex flex-col md:flex-row gap-4">
                    <Field>
                      <FieldLabel>Chave secreta</FieldLabel>
                      <Input value={integracaoPagarme?.chavesecreta_pagarme ?? undefined} onChange={(e) => setIntegracaoPagarme(prev => ({...prev!, chavesecreta_pagarme: e.target.value}))}/>
                    </Field>
                  </FieldGroup>
                </CardContent>
                <CardFooter className="flex flex-row-reverse">
                  <Button onClick={salvarPagarme}>{saving ? <><Spinner /> Salvando...</> : 'Salvar'}</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </LayoutAutenticado>
  )
}