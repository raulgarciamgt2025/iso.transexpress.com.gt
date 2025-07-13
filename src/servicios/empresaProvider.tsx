import { API_URL } from "../configs/apiConfig";

export interface Empresa {
    id_empresa: number;
    nombre: string;
    direccion: string;
    contacto: string;
}

export const fetchEmpresas = async (token): Promise<Empresa[]> => {
    try {
        const response = await fetch(`${API_URL}empresas`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching empresas: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching empresas:", error);
        return []; // Return empty array instead of throwing
    }
};

export const fetchEmpresaById = async (id: number, token): Promise<Empresa[]> => {
    try {
        const response = await fetch(`${API_URL}empresas/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (!response.ok) {
            throw new Error(`Error fetching empresa with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const empresaData = data.data || data;
        // Return as array since similar patterns expect array format
        return Array.isArray(empresaData) ? empresaData : [empresaData];
    } catch (error) {
        console.error("Error fetching empresa by ID:", error);
        throw error;
    }
};

export const createEmpresa = async (empresa: Omit<Empresa, "id_empresa">, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}empresas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(empresa),
        });
        
        if (!response.ok) {
            throw new Error(`Error creating empresa: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error creating empresa:", error);
        return { estado: false, mensaje: "Error al crear la empresa", data: null };
    }
};

export const updateEmpresas = async (empresa: Empresa, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}empresas/${empresa.id_empresa}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(empresa),
        });
        
        if (!response.ok) {
            throw new Error(`Error updating empresa: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result; // Return the full response object
    } catch (error) {
        console.error("Error updating empresa:", error);
        return { estado: false, mensaje: "Error al actualizar la empresa", data: null };
    }
};

export const deleteEmpresa = async (id: number, token): Promise<any> => {
    try {
        const body = { id_empresa: id };
        const response = await fetch(`${API_URL}empresas/${id}`, {
            method: "DELETE",
             headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
             body: JSON.stringify(body),
        });
        
        if (!response.ok) {
            throw new Error("Error al eliminar la empresa");
        }
        
        // Try to parse JSON response, fallback to success object
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Empresa eliminada correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting empresa:", error);
        return { estado: false, mensaje: "Error al eliminar la empresa", success: false };
    }
};