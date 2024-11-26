import { ReactNode } from "react";

interface ModalMockProps {
    children: ReactNode;
    "data-testid": string;
    isOpen: boolean;
}

interface InputMockProps {
    value: string;
    onIonBlur: (e: unknown) => void;
    onIonFocus: (e: unknown) => void; 
    onIonInput: (e: unknown) => void;
    "data-testid": string;
}

interface CheckboxMockProps {
    value: string;
    onIonChange: (e: unknown) => void;
    "data-testid": string;
    checked: boolean;
}

export type { ModalMockProps, InputMockProps, CheckboxMockProps }