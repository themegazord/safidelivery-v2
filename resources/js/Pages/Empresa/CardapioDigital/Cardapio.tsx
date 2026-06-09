import LayoutCardapio from "@/Layouts/LayoutCardapio"

interface IProps {
  interacao_id: string,
  tipo_funcionamento: string
}

export default function Cardapio({interacao_id, tipo_funcionamento}: IProps) {
  return (
    <LayoutCardapio>
      <p><a href="">adawda</a></p>
    </LayoutCardapio>
  )
}