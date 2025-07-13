import { API_URL } from "../../configs/apiConfig";
import Swal from 'sweetalert2';

export interface Periodo {
    id_periodo: number;
    label: string;
    fecha_inicio: Date;
    fecha_fin: Date;
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

export const fetchPeriodo = async (token: string, empresa: number): Promise<Periodo[]> => {
    try {
        const response = await fetch(`${API_URL}periodos/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching periodos: ${response.statusText}`);
        }
        
        const data = await response.json();
        const periodos = Array.isArray(data) ? data : (data.data || []);
        
        // Convert string dates to Date objects
        return periodos.map((periodo: any) => ({
            ...periodo,
            fecha_inicio: new Date(periodo.fecha_inicio),
            fecha_fin: new Date(periodo.fecha_fin)
        }));
    } catch (error) {
        console.error("Error fetching periodos:", error);
        return [];
    }
};

export const fetchPeriodoById = async (id: number, token: string): Promise<Periodo> => {
    try {
        const response = await fetch(`${API_URL}periodos/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            throw new Error("Session expired");
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching periodo with id ${id}: ${response.statusText}`);
        }
        
        const data = await response.json();
        return {
            ...data,
            fecha_inicio: new Date(data.fecha_inicio),
            fecha_fin: new Date(data.fecha_fin)
        } as Periodo;
    } catch (error) {
        console.error("Error fetching perido by ID:", error);
        throw error;
    }
};

export const createPeriodo = async (periodo: Omit<Periodo, "id_periodo">, token: string): Promise<any> => {
    try {
        
        // Convert Date objects to strings for API
        const periodoForAPI = {
            ...periodo,
            fecha_inicio: periodo.fecha_inicio.toISOString().split('T')[0], // YYYY-MM-DD format
            fecha_fin: periodo.fecha_fin.toISOString().split('T')[0]
        };
        console.log(JSON.stringify(periodoForAPI));
        const response = await fetch(`${API_URL}periodos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(periodoForAPI),
        });

        console.log(response)        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error creating perido: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.log(error);
        return { estado: false, mensaje: "Error al crear el área", data: null };
    }
};

export const updatePeriodo = async (periodo: Periodo, token: string): Promise<any> => {
    try {
        // Convert Date objects to strings for API
        const periodoForAPI = {
            ...periodo,
            fecha_inicio: periodo.fecha_inicio.toISOString().split('T')[0], // YYYY-MM-DD format
            fecha_fin: periodo.fecha_fin.toISOString().split('T')[0]
        };
        
        const response = await fetch(`${API_URL}periodos/${periodo.id_periodo}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(periodoForAPI),
        });
        
        if (response.status === 401) {
            handle401Error();
            return { estado: false, mensaje: "Sesión inválida", data: null };
        }
        
        if (!response.ok) {
            throw new Error(`Error updating periodo: ${response.statusText}`);
        }
        
        const result = await response.json();
        return result;
    } catch (error) {
        console.error("Error updating periodo:", error);
        return { estado: false, mensaje: "Error al actualizar el área", data: null };
    }
};

export const deletePeriodo = async (id: number, token: string): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}periodos/${id}`, {
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
        console.error("Error deleting periodo:", error);
        return { estado: false, mensaje: "Error al eliminar el periodo", success: false };
    }
};


