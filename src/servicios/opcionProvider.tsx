import { API_URL } from "../configs/apiConfig";

export interface Opcion {
    id_opcion: number;
    descripcion: string;
    ruta: string;
    orden: number;
    id_menu: number;
    id_empresa: number;
}


export const fetchOpcion = async (token): Promise<Opcion[]> => {
    try {
        const response = await fetch(`${API_URL}Opcion`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as Opcion[];
    } catch (error) {
        console.error("Error fetching opcion:", error);
        throw error;
    }
};

export const fetchOpcionModulo = async (idMenu: number, token): Promise<Opcion[]> => {
    try {
        const response = await fetch(`${API_URL}Opcion/Modulo/${idMenu}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as Opcion[];
    } catch (error) {
        console.error("Error fetching opcion:", error);
        throw error;
    }
};

export const fetchOpcionById = async (id: number, token): Promise<Opcion> => {
    try {
        const response = await fetch(`${API_URL}Opcion/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching opcion with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as Opcion;
    } catch (error) {
        console.error("Error fetching opcion by ID:", error);
        throw error;
    }
};

export const createOpcion = async (opcion: Opcion, token): Promise<Opcion> => {
    try {
        const response = await fetch(`${API_URL}Opcion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(opcion),
        });
        return (await response.json()) as Opcion;
    } catch (error) {
        console.error("Error creating opcion:", error);
        throw error;
    }
};

export const updateOpcion = async (opcion: Opcion, token): Promise<Opcion> => {
    try {
        const response = await fetch(`${API_URL}Opcion`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(opcion),
        });
        return (await response.json()) as Opcion;
    } catch (error) {
        console.error("Error updating opcion:", error);
        throw error;
    }
};

export const deleteOpcion = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}Opcion?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting opcion:", error);
        throw error;
    }
};