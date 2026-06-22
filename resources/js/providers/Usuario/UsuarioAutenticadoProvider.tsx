import { UsuarioAutenticadoContext } from "@/contexts/Usuario/UsuarioAutenticadoContext";
import { IUsuario } from "@/types/usuario-autenticado/usuario";
import { ReactNode, useState } from "react";

export default function UsuarioAutenticadoProvider({
    children,
}: {
    children: ReactNode;
}) {

  const [usuarioAutenticado, setUsuarioAutenticado ] = useState<IUsuario | undefined>(undefined)

  function adicionarUsuarioLogado(usuario?: IUsuario) {
    setUsuarioAutenticado(prev => usuario);
  }

  return (
    <UsuarioAutenticadoContext.Provider value={{
      usuario: usuarioAutenticado,
      adicionaUsuarioLogado: adicionarUsuarioLogado
    }}>
      {children}
    </UsuarioAutenticadoContext.Provider>
  )
}