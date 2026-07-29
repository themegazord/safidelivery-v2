import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { H4 } from "@/components/utils/Heading";
import { Link, usePage } from "@inertiajs/react";
import { ChevronLeft } from "lucide-react";

export default function FinalizarPedidoHeader() {
  const { interacao_id, tipo_funcionamento } = usePage<{
    interacao_id: string,
    tipo_funcionamento: string
  }>().props
  return (
        <Card>
            <CardHeader>
                <CardTitle className="flex">
                    <Button
                        variant="link"
                        render={
                            <Link
                                href={route("aplicacao.empresa.cardapio-digital", {
                                    interacao_id,
                                    tipo_funcionamento,
                                })}
                            />
                        }
                    >
                        <ChevronLeft className="size-6" />
                    </Button>
                    <H4>Finalize seu pedido</H4>
                </CardTitle>
            </CardHeader>
        </Card>
    );
}
