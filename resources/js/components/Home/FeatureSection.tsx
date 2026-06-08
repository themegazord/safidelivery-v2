import { Card } from "@/components/ui/card"
import {
  UtensilsCrossed,
  Bike,
  BarChart3,
  FileText,
  Bell,
  Smartphone,
  type LucideIcon,
} from "lucide-react"

interface Feature {
  icon: LucideIcon
  title: string
  description: string
}

const features: Feature[] = [
  {
    icon: Bike,
    title: "Integração com iFood",
    description: "Conecte sua conta do iFood e receba todos os pedidos diretamente na plataforma, sem retrabalho.",
  },
  {
    icon: UtensilsCrossed,
    title: "Gestão de cardápio",
    description: "Crie, edite e organize seu cardápio em poucos cliques, com fotos, preços e categorias.",
  },
  {
    icon: Bell,
    title: "Pedidos em tempo real",
    description: "Acompanhe todos os pedidos em tempo real e atualize o status para manter seus clientes informados.",
  },
  {
    icon: FileText,
    title: "Notas fiscais automáticas",
    description: "Exporte notas fiscais automaticamente e mantenha sua operação sempre em dia com o fisco.",
  },
  {
    icon: BarChart3,
    title: "Relatórios e métricas",
    description: "Visualize o desempenho do seu delivery com relatórios detalhados de vendas e produtos.",
  },
  {
    icon: Smartphone,
    title: "Acesse de qualquer lugar",
    description: "Gerencie seu delivery do computador ou do celular, onde e quando você precisar.",
  },
]

export function FeaturesSection() {
  return (
    <section className="py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
            Tudo que você precisa para <span className="text-primary">crescer seu delivery</span>
          </h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Ferramentas poderosas para simplificar sua operação e aumentar suas vendas
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Card
                key={feature.title}
                className="group transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="space-y-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{feature.description}</p>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
