import { API_URL } from "../../configs/apiConfig";
import Swal from 'sweetalert2';

export interface PeriodoAreaProceso {
    id_configuracion: number;
    id_periodo: number;
    id_area: number;
    id_proceso: number;
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

export const fetchPeriodoAreaProceso = async (token: string, empresa: number): Promise<PeriodoAreaProceso[]> => {
    try {
        const response = await fetch(`${API_URL}periodo-area-proceso/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching item: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching items:", error);
        return [];
    }
};

export const fetchPeriodoAreaProcesoById = async (id: number, token: string): Promise<PeriodoAreaProceso> => {
    try {
        const response = await fetch(`${API_URL}periodo-area-proceso/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            throw new Error("Session expired");
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching item with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as PeriodoAreaProceso;
    } catch (error) {
        console.error("Error fetching area by ID:", error);
        throw error;
    }
};

export const createPeriodoAreaProceso = async (item: Omit<PeriodoAreaProceso, "id_configuracion">, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}periodo-area-proceso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error creating item: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating item:", error);
        return { estado: false, mensaje: "Error al crear el item", data: null };
    }
};

export const updatePeriodoAreaProceso = async (item: PeriodoAreaProceso, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}periodo-area-proceso/${item.id_configuracion}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error updating item: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating item:", error);
        return { estado: false, mensaje: "Error al actualizar el item", data: null };
    }
};

export const deletePeriodoAreaProceso = async (id: number, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}periodo-area-proceso/${id}`, {
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
            throw new Error("Error al eliminar el item");
        }
        
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Item eliminada correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting item:", error);
        return { estado: false, mensaje: "Error al eliminar el item", success: false };
    }
};


