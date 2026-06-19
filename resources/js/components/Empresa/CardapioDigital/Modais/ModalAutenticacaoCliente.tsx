import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Form } from "@inertiajs/react";

interface IProps {
    open: boolean;
    setOpen: (value: boolean) => void;
}

export default function ModalAutenticacaoCliente({ open, setOpen }: IProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Seus dados:</DialogTitle>
                    <DialogDescription>
                        Para realizar seu pedido vamos precisar de suas
                        informações, este é um ambiente protegido.
                    </DialogDescription>
                </DialogHeader>
                <Form>
                    <Field>
                        <FieldLabel></FieldLabel>
                    </Field>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
