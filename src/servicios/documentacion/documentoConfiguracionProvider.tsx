import { API_URL } from "@/configs/apiConfig";

export interface DocumentoConfiguracion {
    id_documento: number;
    id_configuracion: number;
    fecha_grabo: string;
    id_usuario_grabo: number;
    descripcion: string;
    id_usuario_editor: number;
    id_usuario_responsable: number;
    estado: string;
    id_empresa: number;
}

export interface Usuario {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string | null;
    created_at?: string;
    updated_at?: string;
}

export const fetchDocumentosPorConfiguracion = async (id_configuracion: number, token: string): Promise<DocumentoConfiguracion[]> => {
    try {
        const response = await fetch(`${API_URL}documentos/configuracion/${id_configuracion}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("id_usuario");
                sessionStorage.removeItem("id_empresa");
                window.location.href = "/auth/login";
                return [];
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching documentos:", error);
        throw error;
    }
};

export const fetchUsuarios = async (token: string): Promise<Usuario[]> => {
    try {
        const response = await fetch(`${API_URL}usuarios`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("id_usuario");
                sessionStorage.removeItem("id_empresa");
                window.location.href = "/auth/login";
                return [];
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching usuarios:", error);
        throw error;
    }
};

// CRUD Operations for Documents
export const createDocumentoConfiguracion = async (
    documento: Omit<DocumentoConfiguracion, 'id_documento' | 'fecha_grabo'>,
    token: string
): Promise<DocumentoConfiguracion> => {
    try {
        const response = await fetch(`${API_URL}documentos`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(documento)
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("id_usuario");
                sessionStorage.removeItem("id_empresa");
                window.location.href = "/auth/login";
                throw new Error("Unauthorized");
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error creating documento:", error);
        throw error;
    }
};

export const updateDocumentoConfiguracion = async (
    id_documento: number,
    documento: Partial<DocumentoConfiguracion>,
    token: string
): Promise<DocumentoConfiguracion> => {
    try {
        const response = await fetch(`${API_URL}documentos/${id_documento}`, {
            method: 'PUT',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(documento)
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("id_usuario");
                sessionStorage.removeItem("id_empresa");
                window.location.href = "/auth/login";
                throw new Error("Unauthorized");
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error updating documento:", error);
        throw error;
    }
};

export const deleteDocumentoConfiguracion = async (
    id_documento: number,
    token: string
): Promise<void> => {
    try {
        const response = await fetch(`${API_URL}documentos/${id_documento}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                sessionStorage.removeItem("token");
                sessionStorage.removeItem("id_usuario");
                sessionStorage.removeItem("id_empresa");
                window.location.href = "/auth/login";
                throw new Error("Unauthorized");
            }
            throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error("Error deleting documento:", error);
        throw error;
    }
};
