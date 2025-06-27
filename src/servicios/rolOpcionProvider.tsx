import { API_URL } from "../configs/apiConfig";

export type RolOpcion = {
    descripcion: string;
    id_rol_opcion: number;
    id_rol: number;
    rol: string;
    id_opcion: number;
    opcion: string;
    id_empresa: number;
};

export const fetchRolOpcion = async (id: number, token): Promise<RolOpcion[]> => {
    try {
        const response = await fetch(`${API_URL}RolOpcion/rol/` + id, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching Rol Opcion:", error);
        throw error;
    }
};

export const fetchRolOpcionById = async (id: number, token): Promise<RolOpcion> => {
    try {
        const response = await fetch(`${API_URL}RolOpcion/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching opcion with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching Rol Opcion by ID:", error);
        throw error;
    }
};

export const createRolOpcion = async (rolOpcion, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}RolOpcion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rolOpcion),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating Rol Opcion:", error);
        throw error;
    }
};

export const updateRolOpcion = async (rolOpcion, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}RolOpcion`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rolOpcion),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating Rol Opcion:", error);
        throw error;
    }
};

export const deleteRolOpcion = async (id: number, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}RolOpcion?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting Rol Opcion:", error);
        throw error;
    }
};