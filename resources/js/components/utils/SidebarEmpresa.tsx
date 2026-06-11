import React from "react";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../ui/sidebar";
import {
    BadgePercent,
    BarChart3,
    BookOpen,
    Bug,
    Building2,
    CalendarDays,
    Clock,
    CreditCard,
    FileText,
    HelpCircle,
    LogOut,
    MapPin,
    QrCode,
    Star,
    Truck,
    Undo2,
    Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Link } from "@inertiajs/react";

export default function SidebarEmpresa() {
    const itensMenuSideBar = [
        {
            grupo: "Desempenho e vendas",
            itens: [
                { link: "#", icon: <BarChart3 />, label: "Desempenho" },
                { link: "#", icon: <FileText />, label: "Pedidos" },
            ],
        },
        {
            grupo: "Marketing",
            itens: [
                { link: "#", icon: <Users />, label: "Seus clientes" },
                { link: "#", icon: <BadgePercent />, label: "Promoções" },
                { link: "#", icon: <Undo2 />, label: "Cashback" },
                { link: "#", icon: <Star />, label: "Fidelidade" },
            ],
        },
        {
            grupo: "Configurações da Loja",
            itens: [
                { link: "#", icon: <BookOpen />, label: "Cardápios" },
                {
                    link: "#",
                    icon: <MapPin />,
                    label: "Configurações de entrega",
                },
                { link: "#", icon: <Clock />, label: "Horários" },
                { link: "#", icon: <CalendarDays />, label: "Agendamentos" },
                {
                    link: "#",
                    icon: <CreditCard />,
                    label: "Formas de pagamento",
                },
                { link: "#", icon: <QrCode />, label: "QR Code das mesas" },
                { link: "#", icon: <Building2 />, label: "Sua loja" },
            ],
        },
        {
            grupo: "Ajuda",
            itens: [
                { link: "#", icon: <HelpCircle />, label: "Chamados e ajuda" },
                { link: "#", icon: <Bug />, label: "Encontrou um problema?" },
            ],
        },
    ];

    return (
        <Sidebar className="bg-primary">
            <SidebarHeader className="flex flex-row items-center gap-2 px-4 py-3">
                <Truck className="size-5 shrink-0" />
                <span className="text-sm font-semibold">SAFI Delivery</span>
            </SidebarHeader>
            <SidebarContent>
                {itensMenuSideBar.map((itemMenu, idx) => (
                    <SidebarGroup key={idx}>
                        <SidebarGroupLabel>{itemMenu.grupo}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {itemMenu.itens.map((item) => (
                                    <SidebarMenuItem key={item.label}>
                                        <SidebarMenuButton asChild>
                                            <Link href={item.link}>
                                                {item.icon}
                                                <span>{item.label}</span>
                                            </Link>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter>
                <Link href={route("aplicacao.autenticacao.empresa.logout")}>
                    <Button variant="destructive" className="w-full">
                        Sair <LogOut />
                    </Button>
                </Link>
            </SidebarFooter>
        </Sidebar>
    );
}
