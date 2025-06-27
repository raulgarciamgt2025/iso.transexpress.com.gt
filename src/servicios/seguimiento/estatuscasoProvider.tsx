import { API_URL } from "../../configs/apiConfig";


export interface EstatusCaso {
    id_estatus?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchEstatusCaso = async (token, empresa): Promise<EstatusCaso[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/EstatusCaso/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as EstatusCaso[];
    } catch (error) {
        console.error("Error fetching EstatusCaso:", error);
        throw error;
    }
};

export const fetchEstatusCasoById = async (id: number, token): Promise<EstatusCaso> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/EstatusCaso/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching EstatusCaso with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as EstatusCaso;
    } catch (error) {
        console.error("Error fetching EstatusCaso by ID:", error);
        throw error;
    }
};

export const createEstatusCaso = async (estatuscaso: EstatusCaso, token): Promise<EstatusCaso> => {
    const { id_estatus, ...estatucascasoSinId } = estatuscaso;
    try {
        const response = await fetch(`${API_URL}seguimiento/EstatusCaso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(estatucascasoSinId),
        });
        return await response.json() as EstatusCaso;
    } catch (error) {
        console.error("Error creating estatus caso:", error);
        throw error;
    }
};

export const updateEstatusCaso = async (item: EstatusCaso, token): Promise<EstatusCaso> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/EstatusCaso`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as EstatusCaso;
    } catch (error) {
        console.error("Error updating estatus caso:", error);
        throw error;
    }
};

export const deleteEstatusCaso = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/EstatusCaso?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el estatus caso");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting estatus caso:", error);
        throw error;
    }
};