import { Card } from "@/components/ui/card"

interface Step {
  number: string
  title: string
  description: string
}

const steps: Step[] = [
  {
    number: "1",
    title: "Conecte suas contas",
    description: "Integre o iFood e configure seu cardápio em poucos minutos com nosso passo a passo guiado.",
  },
  {
    number: "2",
    title: "Receba os pedidos",
    description: "Todos os pedidos chegam em um só lugar, prontos para serem gerenciados em tempo real.",
  },
  {
    number: "3",
    title: "Cresça seu negócio",
    description: "Acompanhe métricas, emita notas fiscais e tome decisões melhores para vender mais.",
  },
]

export function StepsSection() {
  return (
    <section className="border-y border-border bg-muted/50 py-24 md:py-32">
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-3xl space-y-4 text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">Como funciona</h2>
          <p className="text-pretty text-lg text-muted-foreground">
            Três passos simples para transformar sua gestão de delivery
          </p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
          {steps.map((step, index) => (
            <div key={step.number} className="relative">
              {/* Connecting line */}
              {index < steps.length - 1 && (
                <div className="absolute left-[60%] top-16 hidden h-px w-[80%] bg-gradient-to-r from-primary/50 to-transparent md:block" />
              )}

              <Card className="relative h-full">
                <div className="space-y-4 p-8">
                  {/* Number badge */}
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-full border-2 border-primary/30 bg-primary/10">
                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                  </div>

                  <h3 className="text-2xl font-semibold">{step.title}</h3>
                  <p className="leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
