import { API_URL } from "../../configs/apiConfig";
import Swal from 'sweetalert2';

export interface Proceso {
    id_proceso: number;
    descripcion: string;
    id_empresa: number;
}

// Helper function to handle 401 unauthorized responses
const handle401Error = () => {
    Swal.fire({
        title: 'Sesión Inválida',
        text: 'Su sesión ha expirado o no es válida. Por favor, inicie sesión nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Ir al Login',
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then(() => {
        // Clear session and redirect to login
        document.cookie = '_FLACTO_AUTH_KEY_=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/auth/login';
    });
};

export const fetchProceso = async (token: string, empresa: number): Promise<Proceso[]> => {
    try {
        const response = await fetch(`${API_URL}procesos/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching procesos: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching procesos:", error);
        return [];
    }
};

export const fetchProcesoById = async (id: number, token: string): Promise<Proceso> => {
    try {
        const response = await fetch(`${API_URL}procesos/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            throw new Error("Session expired");
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching proceso with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as Proceso;
    } catch (error) {
        console.error("Error fetching proceso by ID:", error);
        throw error;
    }
};

export const createProceso = async (proceso: Omit<Proceso, "id_proceso">, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}procesos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(proceso),
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error creating proceso: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating proceso:", error);
        return { estado: false, mensaje: "Error al crear el proceso", data: null };
    }
};

export const updateProceso = async (proceso: Proceso, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}procesos/${proceso.id_proceso}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(proceso),
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error updating proceso: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating proceso:", error);
        return { estado: false, mensaje: "Error al actualizar el proceso", data: null };
    }
};

export const deleteProceso = async (id: number, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}procesos/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", success: false };
        }
        
        if (!response.ok) {
            throw new Error("Error al eliminar el proceso");
        }
        
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Proceso eliminada correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting procesos:", error);
        return { estado: false, mensaje: "Error al eliminar el proceso", success: false };
    }
};


