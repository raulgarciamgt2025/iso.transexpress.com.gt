import { API_URL } from "../../configs/apiConfig";


export interface TipoProducto {
    id_tipo_producto?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchTipoProducto = async (token, empresa): Promise<TipoProducto[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoProducto/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as TipoProducto[];
    } catch (error) {
        console.error("Error fetching tipo producto:", error);
        throw error;
    }
};

export const fetchTipoProductoById = async (id: number, token): Promise<TipoProducto> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoProducto/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching tipo producto with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as TipoProducto;
    } catch (error) {
        console.error("Error fetching tipo producto by ID:", error);
        throw error;
    }
};

export const createTipoProducto = async (item: TipoProducto, token): Promise<TipoProducto> => {
    const { id_tipo_producto, ...tipoproductoSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoProducto`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(tipoproductoSinId),
        });
        return await response.json() as TipoProducto;
    } catch (error) {
        console.error("Error creating tipo producto:", error);
        throw error;
    }
};

export const updateTipoProducto = async (item: TipoProducto, token): Promise<TipoProducto> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoProducto`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as TipoProducto;
    } catch (error) {
        console.error("Error updating tipo producto:", error);
        throw error;
    }
};

export const deleteTipoProducto = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/TipoProducto?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el tipo de producto");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting tipo producto:", error);
        throw error;
    }
};