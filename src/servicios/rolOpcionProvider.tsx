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
        const response = await fetch(`${API_URL}rol-opcion/rol/` + id, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching rol opciones: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching Rol Opcion:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchRolOpcionById = async (id: number, token): Promise<RolOpcion[]> => {
    try {
        const response = await fetch(`${API_URL}rol-opcion/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching rol opcion with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const rolOpcionData = data.data || data;
        // Return as array since similar patterns expect array format
        return Array.isArray(rolOpcionData) ? rolOpcionData : [rolOpcionData];
    } catch (error) {
        console.error("Error fetching Rol Opcion by ID:", error);
        throw error;
    }
};

export const createRolOpcion = async (rolOpcion, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}rol-opcion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rolOpcion),
        });
        
        if (!response.ok) {
            throw new Error(`Error creating rol opcion: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error creating Rol Opcion:", error);
        return { estado: false, mensaje: "Error al crear la opción del rol", data: null };
    }
};

export const updateRolOpcion = async (rolOpcion, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}rol-opcion/${rolOpcion.id_rol_opcion}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rolOpcion),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating rol opcion: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error updating Rol Opcion:", error);
        return { estado: false, mensaje: "Error al actualizar la opción del rol", data: null };
    }
};

export const deleteRolOpcion = async (id: number, token): Promise<any> => {
    try {
        const body = { id_rol_opcion: id };
        const response = await fetch(`${API_URL}rol-opcion/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar la opción del rol");
        }
        
        // Try to parse JSON response, fallback to success object
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Opción del rol eliminada correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting Rol Opcion:", error);
        return { estado: false, mensaje: "Error al eliminar la opción del rol", success: false };
    }
};