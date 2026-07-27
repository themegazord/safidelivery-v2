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
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "../ui/sidebar";
import {
    BadgePercent,
    BarChart3,
    BookOpen,
    Bug,
    Building2,
    CalendarDays,
    ChevronRight,
    Clock,
    CreditCard,
    FileText,
    HelpCircle,
    LogOut,
    MapPin,
    Plug,
    QrCode,
    Settings,
    Star,
    Store,
    Truck,
    Undo2,
    Users,
} from "lucide-react";
import { Button } from "../ui/button";
import { Link, usePage } from "@inertiajs/react";
import { Collapsible } from "radix-ui";

export default function SidebarEmpresa() {
    const {cnpj} = usePage<{
        cnpj: string
    }>().props
    const itensMenuSideBar = [
        {
            grupo: "Desempenho e vendas",
            itens: [
                { link: route('aplicacao.empresa.desempenho', {cnpj: cnpj}), icon: <BarChart3 />, label: "Desempenho" },
                { link: "#", icon: <FileText />, label: "Pedidos" },
            ],
        },
        {
            grupo: "Marketing",
            itens: [
                { link: "#", icon: <Users />, label: "Seus clientes" },
                { link: route('aplicacao.empresa.promocoes.index', {cnpj: cnpj}), icon: <BadgePercent />, label: "Promoções" },
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
                {
                    icon: <Building2 />,
                    label: "Sua loja",
                    subitens: [
                        { link: route('aplicacao.empresa.configempresa.loja', {cnpj: cnpj}), icon: <Store />, label: "Loja" },
                        { link: route('aplicacao.empresa.configempresa.integracoes', {cnpj: cnpj}), icon: <Plug />, label: "Integrações" },
                        { link: route('aplicacao.empresa.configempresa.configuracoes', {cnpj: cnpj}), icon: <Settings />, label: "Configurações" },
                    ],
                },
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
                                {itemMenu.itens.map((item) =>
                                    item.subitens ? (
                                        <Collapsible.Root
                                            key={item.label}
                                            className="group/collapsible"
                                        >
                                            <SidebarMenuItem>
                                                <Collapsible.Trigger asChild>
                                                    <SidebarMenuButton>
                                                        {item.icon}
                                                        <span>{item.label}</span>
                                                        <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                                                    </SidebarMenuButton>
                                                </Collapsible.Trigger>
                                                <Collapsible.Content>
                                                    <SidebarMenuSub>
                                                        {item.subitens.map((subitem) => (
                                                            <SidebarMenuSubItem key={subitem.label}>
                                                                <SidebarMenuSubButton asChild>
                                                                    <Link href={subitem.link}>
                                                                        {subitem.icon}
                                                                        <span>{subitem.label}</span>
                                                                    </Link>
                                                                </SidebarMenuSubButton>
                                                            </SidebarMenuSubItem>
                                                        ))}
                                                    </SidebarMenuSub>
                                                </Collapsible.Content>
                                            </SidebarMenuItem>
                                        </Collapsible.Root>
                                    ) : (
                                        <SidebarMenuItem key={item.label}>
                                            <SidebarMenuButton asChild>
                                                <Link href={item.link}>
                                                    {item.icon}
                                                    <span>{item.label}</span>
                                                </Link>
                                            </SidebarMenuButton>
                                        </SidebarMenuItem>
                                    ),
                                )}
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
