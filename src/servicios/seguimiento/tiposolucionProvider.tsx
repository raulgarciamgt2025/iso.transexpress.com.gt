import { API_URL } from "../../configs/apiConfig";


export interface TipoSolucion {
    id_tipo_solucion?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchTipoSolucion = async (token, empresa): Promise<TipoSolucion[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSolucion/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as TipoSolucion[];
    } catch (error) {
        console.error("Error fetching tipo solucion:", error);
        throw error;
    }
};

export const fetchTipoSolucionById = async (id: number, token): Promise<TipoSolucion> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSolucion/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching tipo solucion with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as TipoSolucion;
    } catch (error) {
        console.error("Error fetching tipo solucion by ID:", error);
        throw error;
    }
};

export const createTipoSolucion = async (item: TipoSolucion, token): Promise<TipoSolucion> => {
    const { id_tipo_solucion, ...tiposolucionSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSolucion`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(tiposolucionSinId),
        });
        return await response.json() as TipoSolucion;
    } catch (error) {
        console.error("Error creating tipo solucion:", error);
        throw error;
    }
};

export const updateTipoSolucion = async (item: TipoSolucion, token): Promise<TipoSolucion> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSolucion`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as TipoSolucion;
    } catch (error) {
        console.error("Error updating tipo solucion:", error);
        throw error;
    }
};

export const deleteTipoSolucion = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoSolucion?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el tipo de solucion");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting tipo solucion:", error);
        throw error;
    }
};