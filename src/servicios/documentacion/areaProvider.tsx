import { API_URL } from "../../configs/apiConfig";
import Swal from 'sweetalert2';

export interface Area {
    id_area: number;
    descripcion: string;
    estado: string; // ACTIVO='SI', INACTIVO='NO'
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

export const fetchArea = async (token: string, empresa: number): Promise<Area[]> => {
    try {
        const response = await fetch(`${API_URL}areas/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching areas: ${response.statusText}`);
        }
        
        const data = await response.json();
        return Array.isArray(data) ? data : (data.data || []);
    } catch (error) {
        console.error("Error fetching areas:", error);
        return [];
    }
};

export const fetchAreaById = async (id: number, token: string): Promise<Area> => {
    try {
        const response = await fetch(`${API_URL}areas/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            throw new Error("Session expired");
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching area with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return data as Area;
    } catch (error) {
        console.error("Error fetching area by ID:", error);
        throw error;
    }
};

export const createArea = async (area: Omit<Area, "id_area">, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}areas`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(area),
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error creating area: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error creating area:", error);
        return { estado: false, mensaje: "Error al crear el área", data: null };
    }
};

export const updateArea = async (area: Area, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}areas/${area.id_area}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(area),
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error updating area: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating area:", error);
        return { estado: false, mensaje: "Error al actualizar el área", data: null };
    }
};

export const deleteArea = async (id: number, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}areas/${id}`, {
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
            throw new Error("Error al eliminar el área");
        }
        
        try {
            const result = await response.json();
            return result;
        } catch {
            return { estado: true, mensaje: "Área eliminada correctamente", success: true };
        }
    } catch (error) {
        console.error("Error deleting area:", error);
        return { estado: false, mensaje: "Error al eliminar el área", success: false };
    }
};


