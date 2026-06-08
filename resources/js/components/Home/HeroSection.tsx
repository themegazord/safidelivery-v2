import { Button } from "@/components/ui/button"

interface HeroSectionProps {
  whatsappNumber: string
}

export function HeroSection({ whatsappNumber }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-linear-to-b from-primary/5 via-transparent to-transparent" />
      <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-150 w-150 -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

      <div className="container relative mx-auto px-4 py-24 md:py-32 lg:py-40">
        <div className="mx-auto max-w-4xl space-y-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm text-primary">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
            </span>
            Plataforma de gestão de delivery
          </div>

          {/* Headline */}
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            Gerencie todo seu delivery em <span className="text-primary">um só lugar</span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground md:text-xl">
            Integre iFood, gerencie seu cardápio, acompanhe pedidos em tempo real e exporte notas fiscais
            automaticamente. Simplifique sua operação de delivery.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button asChild size="lg" className="group gap-2">
              <a
                href={`https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20contratar%20o%20SAFI%20Delivery`}
                target="_blank"
                rel="noopener noreferrer"
              >
                Começe agora, entre em contato com nossa equipe de vendas
              </a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
