import { cn } from "@/lib/utils"

interface StepsProps extends React.ComponentProps<"div"> {
    totalSteps: number
    currentStep: number
}

function Steps({ totalSteps, currentStep, className, ...props }: StepsProps) {
    return (
        <div
            data-slot="steps"
            className={cn("flex flex-col gap-2", className)}
            {...props}
        >
            <div className="flex items-center gap-2">
                {Array.from({ length: totalSteps }, (_, index) => (
                    <div
                        key={index}
                        className={cn(
                            "h-1.5 flex-1 rounded-full transition-colors",
                            index < currentStep ? "bg-primary" : "bg-muted"
                        )}
                    />
                ))}
            </div>
            <span className="text-right text-sm font-medium text-foreground">
                Passo {currentStep} de {totalSteps}
            </span>
        </div>
    )
}

export { Steps }
