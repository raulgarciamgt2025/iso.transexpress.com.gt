import { API_URL } from "../../configs/apiConfig";


export interface TipoCaso {
    id_tipo_caso?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchTipoCaso = async (token, empresa): Promise<TipoCaso[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoCaso/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as TipoCaso[];
    } catch (error) {
        console.error("Error fetching tipo caso:", error);
        throw error;
    }
};

export const fetchTipoCasoById = async (id: number, token): Promise<TipoCaso> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoCaso/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching tipo caso with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as TipoCaso;
    } catch (error) {
        console.error("Error fetching tipo caso by ID:", error);
        throw error;
    }
};

export const createTipoCaso = async (item: TipoCaso, token): Promise<TipoCaso> => {
    const { id_tipo_caso, ...tipocasoSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoCaso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(tipocasoSinId),
        });
        return await response.json() as TipoCaso;
    } catch (error) {
        console.error("Error creating tipo caso:", error);
        throw error;
    }
};

export const updateTipoCaso = async (item: TipoCaso, token): Promise<TipoCaso> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoCaso`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as TipoCaso;
    } catch (error) {
        console.error("Error updating tipo caso:", error);
        throw error;
    }
};

export const deleteTipoCaso = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoCaso?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el tipo caso");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting tipo caso:", error);
        throw error;
    }
};