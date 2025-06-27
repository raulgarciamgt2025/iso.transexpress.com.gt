import { API_URL } from "../../configs/apiConfig";


export interface TipoSeguimiento {
    id_tipo_seguimiento?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchTipoSeguimiento = async (token, empresa): Promise<TipoSeguimiento[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSeguimiento/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as TipoSeguimiento[];
    } catch (error) {
        console.error("Error fetching tipo seguimiento:", error);
        throw error;
    }
};

export const fetchTipoSeguimientoById = async (id: number, token): Promise<TipoSeguimiento> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSeguimiento/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching tipo seguimiento with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as TipoSeguimiento;
    } catch (error) {
        console.error("Error fetching tipo seguimiento by ID:", error);
        throw error;
    }
};

export const createTipoSeguimiento = async (item: TipoSeguimiento, token): Promise<TipoSeguimiento> => {
    const { id_tipo_seguimiento, ...tiposeguimientoSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSeguimiento`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(tiposeguimientoSinId),
        });
        return await response.json() as TipoSeguimiento;
    } catch (error) {
        console.error("Error creating tipo seguimiento:", error);
        throw error;
    }
};

export const updateTipoSeguimiento = async (item: TipoSeguimiento, token): Promise<TipoSeguimiento> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSeguimiento`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as TipoSeguimiento;
    } catch (error) {
        console.error("Error updating tipo seguimiento:", error);
        throw error;
    }
};

export const deleteTipoSeguimiento = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSeguimiento?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el tipo de seguimiento");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting tipo seguimiento:", error);
        throw error;
    }
};