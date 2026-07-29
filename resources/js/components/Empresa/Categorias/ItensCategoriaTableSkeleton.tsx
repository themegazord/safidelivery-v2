import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableHeader,
    TableBody,
    TableRow,
    TableHead,
    TableCell,
} from "@/components/ui/table";

interface ItensCategoriaTableSkeletonProps {
    categoriaTipo: "P" | "I";
    linhas?: number;
}

function AcoesSkeleton() {
    return (
        <div className="flex flex-col gap-2 md:flex-row md:gap-4">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
        </div>
    );
}

function LinhasPizzaSkeleton({ linhas }: { linhas: number }) {
    return (
        <>
            {Array.from({ length: linhas }).map((_, idx) => (
                <TableRow key={idx}>
                    <TableCell>
                        <Skeleton className="h-4 w-40" />
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-4 w-16" />
                        </div>
                    </TableCell>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-3 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-8 w-full max-w-52" />
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end">
                            <AcoesSkeleton />
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

function LinhasItemNormalSkeleton({ linhas }: { linhas: number }) {
    return (
        <>
            {Array.from({ length: linhas }).map((_, idx) => (
                <TableRow key={idx}>
                    <TableCell>
                        <div className="flex flex-col gap-1">
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-3 w-32" />
                        </div>
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-8 w-full max-w-52" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-8 w-full max-w-52" />
                    </TableCell>
                    <TableCell className="text-right">
                        <div className="flex justify-end">
                            <AcoesSkeleton />
                        </div>
                    </TableCell>
                </TableRow>
            ))}
        </>
    );
}

export function ItensCategoriaTableSkeleton({
    categoriaTipo,
    linhas = 3,
}: ItensCategoriaTableSkeletonProps) {
    if (categoriaTipo === "P") {
        return (
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Sabores</TableHead>
                        <TableHead>Tamanho</TableHead>
                        <TableHead>Preço</TableHead>
                        <TableHead className="w-64">Cód. PDV</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <LinhasPizzaSkeleton linhas={linhas} />
                </TableBody>
            </Table>
        );
    }

    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead className="w-64">Preço</TableHead>
                    <TableHead className="w-64">Cód. PDV</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                <LinhasItemNormalSkeleton linhas={linhas} />
            </TableBody>
        </Table>
    );
}

export default ItensCategoriaTableSkeleton;