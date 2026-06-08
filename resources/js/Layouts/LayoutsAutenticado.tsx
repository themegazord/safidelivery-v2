import SidebarEmpresa from "@/components/utils/SidebarEmpresa";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import React, { ReactNode } from "react";

interface IProps {
	children: ReactNode
}

export default function LayoutAutenticado({ children }: IProps) {
	return (
		<SidebarProvider>
			<SidebarEmpresa />
			<SidebarInset>
				<div className="flex-1 p-4">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	)
}
