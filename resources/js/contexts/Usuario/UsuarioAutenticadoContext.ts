import { IUsuario } from "@/types/usuario-autenticado/usuario";
import { createContext } from "react";

interface IUsuarioAutenticadoContext {
  usuario?: IUsuario,
  adicionaUsuarioLogado: (usuario: IUsuario | undefined) => void
}

export const UsuarioAutenticadoContext = createContext<IUsuarioAutenticadoContext>({
  usuario: undefined,
  adicionaUsuarioLogado: () => {}
})