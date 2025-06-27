import React, { createContext, useContext, useState, ReactNode, Dispatch, SetStateAction } from "react";

interface FormValuesData {
    id_empresa: string | null;
}

interface FormContextType {
    formValuesData: FormValuesData;
    setFormValueData: Dispatch<SetStateAction<FormValuesData>>;
}

const FormContext = createContext<FormContextType | undefined>(undefined);

interface FormProviderProps {
    children: ReactNode;
}

export const FormProvider: React.FC<FormProviderProps> = ({ children }) => {
    const [formValuesData, setFormValueData] = useState<FormValuesData>({
        id_empresa: sessionStorage.getItem("id_empresa"),
    });

    return (
        <FormContext.Provider value={{ formValuesData, setFormValueData }}>
            {children}
        </FormContext.Provider>
    );
};

export const useFormContext = (p0: { id_empresa: string; }) => {
    const context = useContext(FormContext);
    if (!context) {
        throw new Error("useFormContext must be used within a FormProvider");
    }
    return context;
};