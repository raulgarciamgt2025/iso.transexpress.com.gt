import { API_URL } from "../configs/apiConfig";


export interface Modulo {
    id_modulo?: number;
    descripcion: string;
    orden: number;
    icono: string;
    ruta: string;
    id_empresa: number;
}

export const fetchModulo = async (token, empresa): Promise<Modulo[]> => {
    try {
        const response = await fetch(`${API_URL}Modulo/Empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as Modulo[];
    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
};

export const fetchModuloById = async (id: number, token): Promise<Modulo> => {
    try {
        const response = await fetch(`${API_URL}Modulo/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching menu with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as Modulo;
    } catch (error) {
        console.error("Error fetching menu by ID:", error);
        throw error;
    }
};

export const createModulo = async (menu: Modulo, token): Promise<Modulo> => {
    const { id_modulo, ...menuSinId } = menu;
    try {
        const response = await fetch(`${API_URL}Modulo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(menuSinId),
        });
        return await response.json() as Modulo;
    } catch (error) {
        console.error("Error creating menu:", error);
        throw error;
    }
};

export const updateModulo = async (menu: Modulo, token): Promise<Modulo> => {
    try {
        const response = await fetch(`${API_URL}Modulo`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(menu),
        });
        return await response.json() as Modulo;
    } catch (error) {
        console.error("Error updating menu:", error);
        throw error;
    }
};

export const deleteModulo = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}Modulo?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el menú");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting menu:", error);
        throw error;
    }
};