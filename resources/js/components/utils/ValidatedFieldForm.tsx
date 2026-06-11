import React, { useState } from "react";
import { Field, FieldDescription, FieldLabel } from "../ui/field";
import {
    InputGroup,
    InputGroupAddon,
    InputGroupInput,
} from "../ui/input-group";
import { Eye, EyeClosed, Lock, Mail } from "lucide-react";
import { ErrorBag, Errors } from "@inertiajs/core";

interface IProps {
    errors: Errors | ErrorBag;
    trigger: string;
    htmlFor: string;
    label: string;
    htmlId: string;
    htmlName: string;
    objective: "email" | "password";
    haveObjectiveIcon: boolean;
    typeInput: string;
    htmlPlaceholder?: string;
    isRequired: boolean;
    fieldDescription?: string;
}

export default function ValidatedFieldForm({
    errors,
    trigger,
    htmlFor,
    htmlId,
    htmlName,
    label,
    objective,
    haveObjectiveIcon,
    typeInput,
    htmlPlaceholder,
    isRequired,
    fieldDescription,
}: IProps) {
    const [senhaVisivel, setSenhaVisivel] = useState(false);

    return (
        <Field
            data-invalid={!!errors[trigger]}
            aria-invalid={!!errors[trigger]}
        >
            <FieldLabel
                htmlFor={htmlFor}
                className={errors[trigger] ? "text-error" : ""}
            >
                {label}
            </FieldLabel>
            <InputGroup className={errors[trigger] ? "border-error" : ""}>
                {haveObjectiveIcon && (
                    <>
                        {objective === "email" && (
                            <>
                                <InputGroupAddon
                                    className={
                                        errors[trigger] ? "text-error" : ""
                                    }
                                >
                                    <Mail />
                                </InputGroupAddon>
                                <InputGroupInput
                                    type={typeInput}
                                    id={htmlId}
                                    name={htmlName}
                                    placeholder={htmlPlaceholder}
                                    required={isRequired}
                                    aria-invalid={!!errors[trigger]}
                                />
                            </>
                        )}

                        {objective === "password" && (
                            <>
                                <InputGroupAddon
                                    className={
                                        errors[trigger] ? "text-error" : ""
                                    }
                                >
                                    <Lock />
                                </InputGroupAddon>
                                <InputGroupInput
                                    type={!senhaVisivel ? typeInput : "text"}
                                    id={htmlId}
                                    name={htmlName}
                                    placeholder={htmlPlaceholder}
                                    required={isRequired}
                                    aria-invalid={!!errors[trigger]}
                                />
                                <InputGroupAddon
                                    align="inline-end"
                                    onClick={() =>
                                        setSenhaVisivel((prev) => !prev)
                                    }
                                    className={
                                        errors[trigger] ? "text-error" : ""
                                    }
                                >
                                    {!senhaVisivel ? (
                                        <Eye className="cursor-pointer" />
                                    ) : (
                                        <EyeClosed className="cursor-pointer" />
                                    )}
                                </InputGroupAddon>
                            </>
                        )}
                    </>
                )}
            </InputGroup>
            {errors[trigger] && (
                <FieldDescription className="text-error">
                    {errors[trigger] as string}
                </FieldDescription>
            )}
            {fieldDescription && (
                <FieldDescription>{fieldDescription}</FieldDescription>
            )}
        </Field>
    );
}
