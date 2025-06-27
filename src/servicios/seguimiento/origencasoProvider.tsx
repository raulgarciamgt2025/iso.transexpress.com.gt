import { API_URL } from "../../configs/apiConfig";


export interface OrigenCaso {
    id_origen_caso?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchOrigenCaso = async (token, empresa): Promise<OrigenCaso[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/OrigenCaso/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as OrigenCaso[];
    } catch (error) {
        console.error("Error fetching origen caso:", error);
        throw error;
    }
};

export const fetchOrigenCasoById = async (id: number, token): Promise<OrigenCaso> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/OrigenCaso/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching origen caso with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as OrigenCaso;
    } catch (error) {
        console.error("Error fetching origen caso by ID:", error);
        throw error;
    }
};

export const createOrigenCaso = async (origencaso: OrigenCaso, token): Promise<OrigenCaso> => {
    const { id_origen_caso, ...origencasoSinId } = origencaso;
    try {
        const response = await fetch(`${API_URL}seguimiento/OrigenCaso`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(origencasoSinId),
        });
        return await response.json() as OrigenCaso;
    } catch (error) {
        console.error("Error creating origen caso:", error);
        throw error;
    }
};

export const updateOrigenCaso = async (item: OrigenCaso, token): Promise<OrigenCaso> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/OrigenCaso`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as OrigenCaso;
    } catch (error) {
        console.error("Error updating origen caso:", error);
        throw error;
    }
};

export const deleteOrigenCaso = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/OrigenCaso?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el origen caso");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting origen caso:", error);
        throw error;
    }
};