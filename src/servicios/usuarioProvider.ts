import { API_URL } from "../configs/apiConfig";

export interface Usuario {
    id: number;
    name: string;
    email: string;
    created_at?: string;
    updated_at?: string;
}

interface ApiResponse<T> {
    estado: boolean;
    mensaje: string;
    data: T;
}

export const fetchUsuario = async (token): Promise<Usuario[]> => {
    try {
        const response = await fetch(`${API_URL}usuarios`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching usuarios: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching usuarios:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchUsuarioById = async (id: number | string, token): Promise<Usuario[]> => {
    try {
        const response = await fetch(`${API_URL}usuarios/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching usuario with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const usuarioData = data.data || data;
        // Return as array since similar patterns expect array format
        return Array.isArray(usuarioData) ? usuarioData : [usuarioData];
    } catch (error) {
        console.error("Error fetching usuario by ID:", error);
        throw error;
    }
};

export const createUsuario = async (usuario: Omit<Usuario, "id">, token): Promise<ApiResponse<Usuario>> => {
    try {
        const response = await fetch(`${API_URL}usuarios`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(usuario),
        });
        
        if (!response.ok) {
            throw new Error(`Error creating usuario: ${response.statusText}`);
        }
        
        const result = await response.json();
        return {
            estado: true,
            mensaje: result.mensaje || "Usuario creado exitosamente",
            data: result.data || result
        };
    } catch (error) {
        console.error("Error creating usuario:", error);
        return { 
            estado: false, 
            mensaje: error instanceof Error ? error.message : "Error al crear el usuario", 
            data: null 
        };
    }
};

export const updateUsuario = async (usuario: Usuario, token): Promise<ApiResponse<Usuario>> => {
    try {
        const response = await fetch(`${API_URL}usuarios/${usuario.id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(usuario),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating usuario: ${response.statusText}`);
        }
        
        const result = await response.json();
        return {
            estado: true,
            mensaje: result.mensaje || "Usuario actualizado exitosamente",
            data: result.data || result
        };
    } catch (error) {
        console.error("Error updating usuario:", error);
        return { 
            estado: false, 
            mensaje: error instanceof Error ? error.message : "Error al actualizar el usuario", 
            data: null 
        };
    }
};

export const deleteUsuario = async (id: number | string, token): Promise<ApiResponse<any>> => {
    try {
        const body = { id: id };
        const response = await fetch(`${API_URL}usuarios/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar el usuario");
        }
        
        // Try to parse JSON response, fallback to success object
        try {
            const result = await response.json();
            return {
                estado: true,
                mensaje: result.mensaje || "Usuario eliminado correctamente",
                data: result.data || null
            };
        } catch {
            return { 
                estado: true, 
                mensaje: "Usuario eliminado correctamente", 
                data: null 
            };
        }
    } catch (error) {
        console.error("Error deleting usuario:", error);
        return { 
            estado: false, 
            mensaje: error instanceof Error ? error.message : "Error al eliminar el usuario", 
            data: null 
        };
    }
};

export const updateUsuarioPassword = async (id: number | string, password: string, token): Promise<ApiResponse<any>> => {
    try {
        const response = await fetch(`${API_URL}usuarios/${id}/password`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify({ password }),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating password: ${response.statusText}`);
        }
        
        const result = await response.json();
        return {
            estado: true,
            mensaje: result.mensaje || "Contraseña actualizada exitosamente",
            data: result.data || null
        };
    } catch (error) {
        console.error("Error updating password:", error);
        return { 
            estado: false, 
            mensaje: error instanceof Error ? error.message : "Error al actualizar la contraseña", 
            data: null 
        };
    }
};
