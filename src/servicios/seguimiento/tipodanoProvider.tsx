import { API_URL } from "../../configs/apiConfig";


export interface TipoDano {
    id_tipo_dano?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchTipoDano = async (token, empresa): Promise<TipoDano[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoDano/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as TipoDano[];
    } catch (error) {
        console.error("Error fetching tipo daño:", error);
        throw error;
    }
};

export const fetchTipoDanoById = async (id: number, token): Promise<TipoDano> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoDano/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching tipo daño with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as TipoDano;
    } catch (error) {
        console.error("Error fetching tipo daño by ID:", error);
        throw error;
    }
};

export const createTipoDano = async (item: TipoDano, token): Promise<TipoDano> => {
    const { id_tipo_dano, ...tipodanoSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoDano`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(tipodanoSinId),
        });
        return await response.json() as TipoDano;
    } catch (error) {
        console.error("Error creating tipo daño:", error);
        throw error;
    }
};

export const updateTipoDano = async (item: TipoDano, token): Promise<TipoDano> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoDano`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as TipoDano;
    } catch (error) {
        console.error("Error updating tipo daño:", error);
        throw error;
    }
};

export const deleteTipoDano = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoDano?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el tipo daño");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting tipo daño:", error);
        throw error;
    }
};