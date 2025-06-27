import { API_URL } from "../configs/apiConfig";

export interface Empresa {
    id_empresa: number;
    nombre: string;
    direccion: string;
    contacto: string;
}

interface ApiResponse<T> {
    data: T;
}


export const fetchEmpresas = async (token): Promise<Empresa[]> => {
    try {
        const response = await fetch(`${API_URL}Empresa`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data: ApiResponse<Empresa[]> = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching empresas:", error);
        throw error;
    }
};

export const fetchEmpresaById = async (id: number, token): Promise<Empresa> => {
    try {
        const response = await fetch(`${API_URL}Empresa/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching empresa with id ${id}: ${response.statusText}`);
        }
        const data: ApiResponse<Empresa> = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching empresa by ID:", error);
        throw error;
    }
};

export const createEmpresa = async (empresa: Omit<Empresa, "id_empresa">, token): Promise<ApiResponse<Empresa>> => {
    try {
        const response = await fetch(`${API_URL}Empresa`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(empresa),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating empresa:", error);
        throw error;
    }
};

export const updateEmpresas = async (empresa: Empresa, token): Promise<ApiResponse<Empresa>> => {
    try {
        const response = await fetch(`${API_URL}Empresa`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(empresa),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating empresa:", error);
        throw error;
    }
};

export const deleteEmpresa = async (id: number, token): Promise<ApiResponse<Empresa>> => {
    try {
        const response = await fetch(`${API_URL}Empresa?id=${id}`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting empresa:", error);
        throw error;
    }
};