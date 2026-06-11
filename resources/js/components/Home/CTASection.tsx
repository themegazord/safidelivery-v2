import { Button } from "@/components/ui/button";
import { CheckCircle2, MessageCircle } from "lucide-react";

interface CtaSectionProps {
    whatsappNumber: string;
}

const benefits = [
    "Sem contrato de fidelidade",
    "Suporte em português",
    "Implementação em 24h",
];

export function CtaSection({ whatsappNumber }: CtaSectionProps) {
    return (
        <section className="py-24 md:py-32">
            <div className="container mx-auto px-4">
                <div className="mx-auto max-w-4xl">
                    {/* Main CTA Card */}
                    <div className="border-primary/20 from-primary/10 via-primary/5 relative overflow-hidden rounded-2xl border bg-gradient-to-br to-transparent p-8 md:p-12 lg:p-16">
                        {/* Background effect */}
                        <div className="bg-primary/10 pointer-events-none absolute top-0 right-0 h-96 w-96 rounded-full blur-3xl" />

                        <div className="relative space-y-8 text-center">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-bold tracking-tight text-balance md:text-4xl lg:text-5xl">
                                    Pronto para simplificar seu delivery?
                                </h2>
                                <p className="text-muted-foreground mx-auto max-w-2xl text-lg leading-relaxed text-pretty md:text-xl">
                                    Junte-se a centenas de restaurantes que já
                                    estão economizando tempo e aumentando suas
                                    vendas com SAFI Delivery.
                                </p>
                            </div>

                            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                                <Button asChild size="lg" className="gap-2">
                                    <a
                                        href={`https://wa.me/${whatsappNumber}?text=Olá!%20Gostaria%20de%20conhecer%20o%20SAFI%20Delivery`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <MessageCircle className="h-5 w-5" />
                                        Falar no WhatsApp
                                    </a>
                                </Button>
                            </div>

                            <div className="text-muted-foreground flex flex-col items-center justify-center gap-8 pt-4 text-sm sm:flex-row">
                                {benefits.map((benefit) => (
                                    <div
                                        key={benefit}
                                        className="flex items-center gap-2"
                                    >
                                        <CheckCircle2 className="text-primary h-5 w-5" />
                                        {benefit}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
