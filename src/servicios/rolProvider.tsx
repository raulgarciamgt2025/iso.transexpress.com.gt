import { API_URL } from "../configs/apiConfig";

export interface Rol {
    id_rol: number;
    descripcion: string;
    id_empresa: number;
}

const authHeader = () => ({
    "Authorization": `Bearer ${sessionStorage.getItem('token') || ''}`
});

export const fetchRol = async (token, empresa): Promise<Rol[]> => {
    try {
        const response = await fetch(`${API_URL}Rol/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as Rol[];
    } catch (error) {
        console.error("Error fetching rol:", error);
        throw error;
    }
};

export const fetchRolById = async (id: number, token): Promise<Rol> => {
    try {
        const response = await fetch(`${API_URL}Rol/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching opcion with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as Rol;
    } catch (error) {
        console.error("Error fetching rol by ID:", error);
        throw error;
    }
};

export const createRol = async (rol, token): Promise<Rol> => {
    try {
        const response = await fetch(`${API_URL}Rol`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        return (await response.json()) as Rol;
    } catch (error) {
        console.error("Error creating rol:", error);
        throw error;
    }
};

export const updateRol = async (rol, token): Promise<Rol> => {
    try {
        const response = await fetch(`${API_URL}Rol`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        return (await response.json()) as Rol;
    } catch (error) {
        console.error("Error updating rol:", error);
        throw error;
    }
};

export const deleteRol = async (id: number, token): Promise<{ success: boolean; message?: string }> => {
    try {
        const response = await fetch(`${API_URL}Rol?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting rol:", error);
        throw error;
    }
};