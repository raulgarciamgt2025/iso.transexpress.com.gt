import { API_URL } from "../../configs/apiConfig";


export interface TipoServicio {
    id_tipo_servicio?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchTipoServicio = async (token, empresa): Promise<TipoServicio[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoServicio/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as TipoServicio[];
    } catch (error) {
        console.error("Error fetching tipo servicio:", error);
        throw error;
    }
};

export const fetchTipoServicioById = async (id: number, token): Promise<TipoServicio> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoServicio/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching tipo servicio with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as TipoServicio;
    } catch (error) {
        console.error("Error fetching tipo servicio by ID:", error);
        throw error;
    }
};

export const createTipoServicio = async (item: TipoServicio, token): Promise<TipoServicio> => {
    const { id_tipo_servicio, ...tiposervicioSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoServicio`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(tiposervicioSinId),
        });
        return await response.json() as TipoServicio;
    } catch (error) {
        console.error("Error creating tipo servicio:", error);
        throw error;
    }
};

export const updateTipoServicio = async (item: TipoServicio, token): Promise<TipoServicio> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoServicio`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as TipoServicio;
    } catch (error) {
        console.error("Error updating tipo servicio:", error);
        throw error;
    }
};

export const deleteTipoServicio = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoServicio?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el tipo de servicio");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting tipo servicio:", error);
        throw error;
    }
};