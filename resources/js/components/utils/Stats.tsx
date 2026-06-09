import { ReactNode } from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TooltipPosition = "top" | "bottom" | "left" | "right"

type Color = "green" | "red" | "blue" | "yellow" | "orange" | "purple" | "pink" | "gray" | "amber"

const colorMap: Record<Color, { bg: string; text: string }> = {
    green:  { bg: "bg-green-100",  text: "text-green-600" },
    red:    { bg: "bg-red-100",    text: "text-red-600" },
    blue:   { bg: "bg-blue-100",   text: "text-blue-600" },
    yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
    orange: { bg: "bg-orange-100", text: "text-orange-600" },
    purple: { bg: "bg-purple-100", text: "text-purple-600" },
    pink:   { bg: "bg-pink-100",   text: "text-pink-600" },
    gray:   { bg: "bg-gray-100",   text: "text-gray-600" },
    amber:  { bg: "bg-amber-100",  text: "text-amber-600" }
}

interface IProps {
    value?: string | number,
    icon?: ReactNode,
    title?: string,
    description?: string,
    color?: Color,
    tooltip?: string,
    tooltipPosition?: TooltipPosition,
    className?: string,
    isMoney?: boolean
}

export default function Stats({ isMoney, value, icon, title, description, color, tooltip, tooltipPosition = "top", className }: IProps) {
    const colors = color ? colorMap[color] : { bg: "bg-gray-100", text: "" }

    const content = (
        <div className={cn("border rounded-lg px-5 py-4 w-full", colors.bg, className)}>
            <div className="flex items-center gap-3">
                {icon && (
                    <div className={cn("w-9 h-9 flex items-center justify-center", colors.text)}>
                        {icon}
                    </div>
                )}
                <div className="text-left rtl:text-right truncate">
                    {title && (
                        <div className="text-xs text-muted-foreground whitespace-nowrap">{title}</div>
                    )}
                    <div className="font-black text-xl">
                        {isMoney && typeof(value) === 'number'  ? (<>R$ {value.toFixed(2)}</>) : (<>{value}</>)}
                    </div>
                    {description && (
                        <div className="text-sm text-muted-foreground">{description}</div>
                    )}
                </div>
            </div>
        </div>
    )

    if (!tooltip) return content

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>{content}</TooltipTrigger>
                <TooltipContent side={tooltipPosition}>{tooltip}</TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
}
