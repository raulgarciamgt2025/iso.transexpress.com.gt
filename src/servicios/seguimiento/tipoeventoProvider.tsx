import { API_URL } from "../../configs/apiConfig";


export interface TipoEvento {
    id_tipo_evento?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchTipoEvento = async (token, empresa): Promise<TipoEvento[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoEvento/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as TipoEvento[];
    } catch (error) {
        console.error("Error fetching tipo evento:", error);
        throw error;
    }
};

export const fetchTipoEventoById = async (id: number, token): Promise<TipoEvento> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoEvento/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching tipo evento with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as TipoEvento;
    } catch (error) {
        console.error("Error fetching tipo evento by ID:", error);
        throw error;
    }
};

export const createTipoEvento = async (item: TipoEvento, token): Promise<TipoEvento> => {
    const { id_tipo_evento, ...tipoeventoSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoEvento`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(tipoeventoSinId),
        });
        return await response.json() as TipoEvento;
    } catch (error) {
        console.error("Error creating tipo evento:", error);
        throw error;
    }
};

export const updateTipoEvento = async (item: TipoEvento, token): Promise<TipoEvento> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoEvento`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as TipoEvento;
    } catch (error) {
        console.error("Error updating tipo evento:", error);
        throw error;
    }
};

export const deleteTipoEvento = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoEvento?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el tipo de evento");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting tipo evento:", error);
        throw error;
    }
};