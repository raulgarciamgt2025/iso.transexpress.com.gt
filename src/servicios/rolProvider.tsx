import { API_URL } from "../configs/apiConfig";

export interface Rol {
    id_rol: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchRol = async (token, empresa): Promise<Rol[]> => {
    try {
        const response = await fetch(`${API_URL}roles/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching roles: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching roles:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchRolById = async (id: number, token): Promise<Rol[]> => {
    try {
        const response = await fetch(`${API_URL}roles/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching rol with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const rolData = data.data || data;
        // Return as array since similar patterns expect array format
        return Array.isArray(rolData) ? rolData : [rolData];
    } catch (error) {
        console.error("Error fetching rol by ID:", error);
        throw error;
    }
};

export const createRol = async (rol: Omit<Rol, "id_rol">, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}roles`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        
        if (!response.ok) {
            throw new Error(`Error creating rol: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error creating rol:", error);
        return { estado: false, mensaje: "Error al crear el rol", data: null };
    }
};

export const updateRol = async (rol: Rol, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}roles/${rol.id_rol}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating rol: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error updating rol:", error);
        return { estado: false, mensaje: "Error al actualizar el rol", data: null };
    }
};

export const deleteRol = async (id: number, token): Promise<any> => {
    try {
        const body = { id_rol: id };
        const response = await fetch(`${API_URL}roles/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar el rol");
        }
        
        // Try to parse JSON response, fallback to success object
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Rol eliminado correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting rol:", error);
        return { estado: false, mensaje: "Error al eliminar el rol", success: false };
    }
};