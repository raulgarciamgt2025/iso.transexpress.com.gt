import menu from "@/app/pages/seguridad/menu";
import { API_URL } from "../configs/apiConfig";


export interface Modulo {
    id_modulo?: number;
    descripcion: string;
    orden: number;
}

export const fetchModulo = async (token): Promise<Modulo[]> => {
    try {
        const response = await fetch(`${API_URL}modulos`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data as Modulo[];
    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
};

export const fetchModuloById = async (id: number, token): Promise<Modulo> => {
    try {

        const response = await fetch(`${API_URL}modulos/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching menu with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data as Modulo;
    } catch (error) {
        console.error("Error fetching menu by ID:", error);
        throw error;
    }
};

export const createModulo = async (menu: Modulo, token): Promise<Modulo> => {
    const { id_modulo, ...menuSinId } = menu;
    try {
        const response = await fetch(`${API_URL}modulos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(menuSinId),
        });
        return await response.json() as Modulo;
    } catch (error) {
        console.error("Error creating modulo:", error);
        throw error;
    }
};

export const updateModulo = async (menu: Modulo, token): Promise<Modulo> => {
    try {
        const response = await fetch(`${API_URL}modulos/${menu.id_modulo}`, {
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
     const body =  {  id_modulo: id }; 
    try {
        const response = await fetch(`${API_URL}modulos/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar el registro");
        }
        
        const respuesta = { success: true}
        return await respuesta;
    } catch (error) {
        console.error("Error deleting menu:", error);
        throw error;
    }
};