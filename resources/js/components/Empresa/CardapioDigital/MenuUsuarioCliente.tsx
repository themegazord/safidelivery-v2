import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { IAuth } from "@/types/usuario-autenticado/usuario";
import { Link, usePage } from "@inertiajs/react";
import { ClipboardList, LogOut, User } from "lucide-react";

export default function MenuUsuarioCliente() {
    const { auth } = usePage<{ auth: IAuth }>().props;

    if (!auth.user) {
        return null;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="cursor-pointer" />}>
                <User className="size-6" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    className="cursor-pointer"
                    render={<Link href={route("aplicacao.cliente.meus-pedidos")} />}
                >
                    <ClipboardList />
                    Meus pedidos
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="cursor-pointer"
                    variant="destructive"
                    render={<Link href={route("aplicacao.autenticacao.cliente.logout")} />}
                >
                    <LogOut />
                    Sair
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
