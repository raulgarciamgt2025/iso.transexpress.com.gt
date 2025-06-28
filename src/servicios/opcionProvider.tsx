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
        const response = await fetch(`${API_URL}opciones`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching opciones: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching opcion:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchOpcionMenu = async (idMenu: number, token): Promise<Opcion[]> => {
    try {
        const response = await fetch(`${API_URL}opciones/menu/${idMenu}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching opciones for menu ${idMenu}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching opcion:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchOpcionById = async (id: number, token): Promise<Opcion[]> => {
    try {
        const response = await fetch(`${API_URL}opciones/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching opcion with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const opcionData = data.data || data;
        // Return as array since similar patterns expect array format
        return Array.isArray(opcionData) ? opcionData : [opcionData];
    } catch (error) {
        console.error("Error fetching opcion by ID:", error);
        throw error;
    }
};

export const createOpcion = async (opcion: Opcion, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}opciones`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(opcion),
        });
        
        if (!response.ok) {
            throw new Error(`Error creating opcion: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error creating opcion:", error);
        return { estado: false, mensaje: "Error al crear la opción", data: null };
    }
};

export const updateOpcion = async (opcion: Opcion, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}opciones/${opcion.id_opcion}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(opcion),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating opcion: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error updating opcion:", error);
        return { estado: false, mensaje: "Error al actualizar la opción", data: null };
    }
};

export const deleteOpcion = async (id: number, token): Promise<any> => {
    try {
        const body = { id_opcion: id };
        const response = await fetch(`${API_URL}opciones/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
             body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar la opción");
        }
        
        // Try to parse JSON response, fallback to success object
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Opción eliminada correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting opcion:", error);
        return { estado: false, mensaje: "Error al eliminar la opción", success: false };
    }
};