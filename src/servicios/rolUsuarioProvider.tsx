import { API_URL } from "../configs/apiConfig";

export interface RolUsuario {
    id_rol_usuario: number;
    id_rol: number;
    rol: string;
    id_usuario: number;
    nombre_usuario: string;
    id_empresa: number;
    empresa: string;
}


export const fetchRolUsuario = async (idRol: number, token): Promise<RolUsuario[]> => {
    try {
        const response = await fetch(`${API_URL}RolUsuario/rol/` + idRol, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as RolUsuario[];
    } catch (error) {
        console.error("Error fetching rol usuario:", error);
        throw error;
    }
};

export const fetchRolUsuarioById = async (id: number, token): Promise<RolUsuario> => {
    try {
        const response = await fetch(`${API_URL}RolUsuario/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching opcion with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as RolUsuario;
    } catch (error) {
        console.error("Error fetching rol usuario by ID:", error);
        throw error;
    }
};

export const createRolUsuario = async (rol, token): Promise<RolUsuario> => {
    try {
        const response = await fetch(`${API_URL}RolUsuario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        return await response.json() as RolUsuario;
    } catch (error) {
        console.error("Error creating rol usuario:", error);
        throw error;
    }
};

export const updateRolUsuario = async (rol, token): Promise<RolUsuario> => {
    try {
        const response = await fetch(`${API_URL}RolUsuario`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        return await response.json() as RolUsuario;
    } catch (error) {
        console.error("Error updating rol usuario:", error);
        throw error;
    }
};

export const deleteRolUsuario = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}RolUsuario?id=${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token || ''}`
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting rol usuario:", error);
        throw error;
    }
};