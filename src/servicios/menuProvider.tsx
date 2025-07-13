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
        const response = await fetch(`${API_URL}menus/modulo/${idModulo}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching menus for module ${idModulo}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching menu:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchMenuById = async (id: number, token): Promise<Menu[]> => {
    try {
        const response = await fetch(`${API_URL}menus/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching menu with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        // Return as array since menu.tsx expects data[0]
        return Array.isArray(data) ? data : [data];
    } catch (error) {
        console.error("Error fetching menu by ID:", error);
        throw error;
    }
};

export const createMenu = async (menu: Omit<Menu, "id_menu">, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}menus`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(menu),
        });
        
        if (!response.ok) {
            throw new Error(`Error creating menu: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error creating menu:", error);
        return { estado: false, mensaje: "Error al crear el menú", data: null };
    }
};

export const updateMenu = async (menu: Menu, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}menus/${menu.id_menu}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(menu),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating menu: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error updating menu:", error);
        return { estado: false, mensaje: "Error al actualizar el menú", data: null };
    }
};

export const deleteMenu = async (id: number, token): Promise<any> => {
    const body = { id_menu: id };
    try {
        const response = await fetch(`${API_URL}menus/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar el menú");
        }
        
        // Try to parse JSON response, fallback to success object
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Menú eliminado correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting menu:", error);
        return { estado: false, mensaje: "Error al eliminar el menú", success: false };
    }
};