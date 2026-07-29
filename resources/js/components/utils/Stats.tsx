import { ReactNode } from "react";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

type TooltipPosition = "top" | "bottom" | "left" | "right";

type Color =
    | "green"
    | "red"
    | "blue"
    | "yellow"
    | "orange"
    | "purple"
    | "pink"
    | "gray"
    | "amber";

const colorMap: Record<Color, { bg: string; text: string; border: string }> = {
    green: {
        bg: "bg-green-50 dark:bg-green-950/30",
        text: "text-green-600 dark:text-green-400",
        border: "border-green-200 dark:border-green-900",
    },
    red: {
        bg: "bg-red-50 dark:bg-red-950/30",
        text: "text-red-600 dark:text-red-400",
        border: "border-red-200 dark:border-red-900",
    },
    blue: {
        bg: "bg-blue-50 dark:bg-blue-950/30",
        text: "text-blue-600 dark:text-blue-400",
        border: "border-blue-200 dark:border-blue-900",
    },
    yellow: {
        bg: "bg-yellow-50 dark:bg-yellow-950/30",
        text: "text-yellow-600 dark:text-yellow-400",
        border: "border-yellow-200 dark:border-yellow-900",
    },
    orange: {
        bg: "bg-orange-50 dark:bg-orange-950/30",
        text: "text-orange-600 dark:text-orange-400",
        border: "border-orange-200 dark:border-orange-900",
    },
    purple: {
        bg: "bg-purple-50 dark:bg-purple-950/30",
        text: "text-purple-600 dark:text-purple-400",
        border: "border-purple-200 dark:border-purple-900",
    },
    pink: {
        bg: "bg-pink-50 dark:bg-pink-950/30",
        text: "text-pink-600 dark:text-pink-400",
        border: "border-pink-200 dark:border-pink-900",
    },
    gray: {
        bg: "bg-zinc-50 dark:bg-zinc-900",
        text: "text-zinc-600 dark:text-zinc-400",
        border: "border-zinc-200 dark:border-zinc-800",
    },
    amber: {
        bg: "bg-amber-50 dark:bg-amber-950/30",
        text: "text-amber-600 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-900",
    },
};

interface IProps {
    value?: string | number;
    icon?: ReactNode;
    title?: string;
    description?: string;
    color?: Color;
    tooltip?: string;
    tooltipPosition?: TooltipPosition;
    className?: string;
    isMoney?: boolean;
}

export default function Stats({
    isMoney,
    value,
    icon,
    title,
    description,
    color,
    tooltip,
    tooltipPosition = "top",
    className,
}: IProps) {
    const colors = color ? colorMap[color] : colorMap.gray;

    const content = (
        <div
            className={cn(
                "w-full rounded-lg border px-5 py-4 transition-colors",
                colors.bg,
                colors.border,
                className,
            )}
        >
            <div className="flex items-center gap-3">
                {icon && (
                    <div
                        className={cn(
                            "flex h-9 w-9 items-center justify-center",
                            colors.text,
                        )}
                    >
                        {icon}
                    </div>
                )}
                <div className="truncate text-left rtl:text-right">
                    {title && (
                        <div className="text-xs whitespace-nowrap text-zinc-500 dark:text-zinc-400">
                            {title}
                        </div>
                    )}

                    <div className="text-xl font-black text-zinc-900 dark:text-zinc-50">
                        {isMoney && typeof value === "number" ? (
                            <>R$ {value.toFixed(2)}</>
                        ) : (
                            <>{value}</>
                        )}
                    </div>

                    {description && (
                        <div className="text-sm text-zinc-500 dark:text-zinc-400">
                            {description}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (!tooltip) return content;

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger render={content} />
                <TooltipContent side={tooltipPosition}>
                    {tooltip}
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
