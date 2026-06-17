export function converteReal(valor?: number | string) {
    const num =
        typeof valor === "string"
            ? parseFloat(valor.replace(",", "."))
            : Number(valor);
    return num.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
}
