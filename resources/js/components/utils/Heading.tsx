import { cn } from "@/lib/utils"
import React, { ReactNode } from "react"

interface IH1Props {
	children: ReactNode,
	className?: string
}
interface IH2Props {
	children: ReactNode,
	className?: string
}
interface IH3Props {
	children: ReactNode,
	className?: string
}
interface IH4Props {
	children: ReactNode,
	className?: string
}
interface IH5Props {
	children: ReactNode,
	className?: string
}
interface IH6Props {
	children: ReactNode,
	className?: string
}

export function H1({children, className}: IH1Props & React.ComponentProps<"h1">) {
	return (<h1 className={cn("text-5xl", className)}>{children}</h1>)
}

export function H2({children, className}: IH2Props & React.ComponentProps<"h2">) {
	return (<h2 className={cn("text-4xl", className)}>{children}</h2>)
}

export function H3({children, className}: IH3Props & React.ComponentProps<"h3">) {
	return (<h3 className={cn("text-3xl", className)}>{children}</h3>)
}

export function H4({children, className}: IH4Props & React.ComponentProps<"h4">) {
	return (<h4 className={cn("text-2xl", className)}>{children}</h4>)
}

export function H5({children, className}: IH5Props & React.ComponentProps<"h5">) {
	return (<h5 className={cn("text-xl", className)}>{children}</h5>)
}

export function H6({children, className}: IH6Props & React.ComponentProps<"h6">) {
	return (<h6 className={cn("text-lg", className)}>{children}</h6>)
}
