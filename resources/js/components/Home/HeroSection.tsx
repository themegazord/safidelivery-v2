import { Button } from "@/components/ui/button";

interface HeroSectionProps {
    whatsappNumber: string;
}

export function HeroSection({ whatsappNumber }: HeroSectionProps) {
    return (
        <section className="border-border relative overflow-hidden border-b">
            {/* Background gradient effect */}
            <div className="from-primary/5 pointer-events-none absolute inset-0 -z-10 bg-linear-to-b via-transparent to-transparent" />
            <div className="bg-primary/10 pointer-events-none absolute top-1/4 left-1/2 -z-10 h-150 w-150 -translate-x-1/2 rounded-full blur-3xl" />

            <div className="relative container mx-auto px-4 py-24 md:py-32 lg:py-40">
                <div className="mx-auto max-w-4xl space-y-8 text-center">
                    {/* Badge */}
                    <div className="border-primary/20 bg-primary/10 text-primary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="bg-primary absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" />
                            <span className="bg-primary relative inline-flex h-2 w-2 rounded-full" />
                        </span>
                        Plataforma de gestão de delivery
                    </div>

                    {/* Headline */}
                    <h1 className="text-4xl font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
                        Gerencie todo seu delivery em{" "}
                        <span className="text-primary">um só lugar</span>
                    </h1>

                    {/* Subheadline */}
                    <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed text-pretty md:text-xl">
                        Integre iFood, gerencie seu cardápio, acompanhe pedidos
                        em tempo real e exporte notas fiscais automaticamente.
                        Simplifique sua operação de delivery.
                    </p>

                    {/* CTA Buttons */}
                    <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Button asChild size="lg" className="group gap-2">
                            <a
                                href={`https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20contratar%20o%20SAFI%20Delivery`}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Começe agora, entre em contato com nossa equipe
                                de vendas
                            </a>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
