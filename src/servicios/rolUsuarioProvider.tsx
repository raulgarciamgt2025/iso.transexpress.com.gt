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
        const response = await fetch(`${API_URL}rol-usuario/rol/` + idRol, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching rol usuarios: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching rol usuario:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchRolUsuarioById = async (id: number, token): Promise<RolUsuario[]> => {
    try {
        const response = await fetch(`${API_URL}rol-usuario/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching rol usuario with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const rolUsuarioData = data.data || data;
        // Return as array since similar patterns expect array format
        return Array.isArray(rolUsuarioData) ? rolUsuarioData : [rolUsuarioData];
    } catch (error) {
        console.error("Error fetching rol usuario by ID:", error);
        throw error;
    }
};

export const createRolUsuario = async (rol, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}rol-usuario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        
        if (!response.ok) {
            throw new Error(`Error creating rol usuario: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error creating rol usuario:", error);
        return { estado: false, mensaje: "Error al crear el rol de usuario", data: null };
    }
};

export const updateRolUsuario = async (rol, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}rol-usuario/${rol.id_rol_usuario}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(rol),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating rol usuario: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error updating rol usuario:", error);
        return { estado: false, mensaje: "Error al actualizar el rol de usuario", data: null };
    }
};

export const deleteRolUsuario = async (id: number, token): Promise<any> => {
    try {
        const body = { id_rol_usuario: id };
        const response = await fetch(`${API_URL}rol-usuario/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar el rol de usuario");
        }
        
        // Try to parse JSON response, fallback to success object
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Rol de usuario eliminado correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting rol usuario:", error);
        return { estado: false, mensaje: "Error al eliminar el rol de usuario", success: false };
    }
};