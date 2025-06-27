import { API_URL } from "../configs/apiConfig";

export interface Menu {
    id_menu: number;
    descripcion: string;
    icono: string;
    orden: number;
    id_modulo: number;
    id_empresa: number;
}


export const fetchMenuModulo = async (idModulo: number, token): Promise<Menu[]> => {
    try {
        const response = await fetch(`${API_URL}Menu/modulo/${idModulo} `, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as Menu[];
    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
};

export const fetchMenuById = async (id: number, token): Promise<Menu> => {
    try {
        const response = await fetch(`${API_URL}Menu/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching menu with id ${id}: ${response.statusText} `);
        }
        const data = await response.json();
        return data.data as Menu;
    } catch (error) {
        console.error("Error fetching menu by ID:", error);
        throw error;
    }
};

export const createMenu = async (menu: Omit<Menu, "id_menu">, token): Promise<Menu> => {
    try {
        const response = await fetch(`${API_URL}Menu`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(menu),
        });
        return (await response.json()).data as Menu;
    } catch (error) {
        console.error("Error creating menu:", error);
        throw error;
    }
};

export const updateMenu = async (menu: Menu, token): Promise<Menu> => {
    try {
        const response = await fetch(`${API_URL}Menu`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(menu),
        });
        return (await response.json()).data as Menu;
    } catch (error) {
        console.error("Error updating menu:", error);
        throw error;
    }
};

export const deleteMenu = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}Menu?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
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