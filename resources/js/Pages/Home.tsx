import { CtaSection } from "@/components/Home/CTASection";
import { FeaturesSection } from "@/components/Home/FeatureSection";
import { HeroSection } from "@/components/Home/HeroSection";
import { StepsSection } from "@/components/Home/StepsSection";

export default function Home({whatsappNumero}: {whatsappNumero: string}) {
    return (
        <main>
            <HeroSection whatsappNumber={whatsappNumero} />
            <FeaturesSection />
            <StepsSection />
            <CtaSection whatsappNumber={whatsappNumero}/>
        </main>
    )
}
