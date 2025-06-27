import { API_URL } from "../../configs/apiConfig";


export interface ProductoGenerico {
    id_producto?: number;
    descripcion: string;
    id_empresa: number;
}

export const fetchProductoGenerico = async (token, empresa): Promise<ProductoGenerico[]> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/ProductoGenerico/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data = await response.json();
        return data.data as ProductoGenerico[];
    } catch (error) {
        console.error("Error fetching producto generico:", error);
        throw error;
    }
};

export const fetchProductoGenericoById = async (id: number, token): Promise<ProductoGenerico> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/ProductoGenerico/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching producto generico with id ${id}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.data as ProductoGenerico;
    } catch (error) {
        console.error("Error fetching producto generico by ID:", error);
        throw error;
    }
};

export const createProductoGenerico = async (item: ProductoGenerico, token): Promise<ProductoGenerico> => {
    const { id_producto, ...productogenericoSinId } = item;
    try {
        const response = await fetch(`${API_URL}seguimiento/ProductoGenerico`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(productogenericoSinId),
        });
        return await response.json() as ProductoGenerico;
    } catch (error) {
        console.error("Error creating producto generico:", error);
        throw error;
    }
};

export const updateProductoGenerico = async (item: ProductoGenerico, token): Promise<ProductoGenerico> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/ProductoGenerico`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(item),
        });
        return await response.json() as ProductoGenerico;
    } catch (error) {
        console.error("Error updating producto generico:", error);
        throw error;
    }
};

export const deleteProductoGenerico = async (id: number, token): Promise<{ success: boolean }> => {
    try {
        const response = await fetch(`${API_URL}seguimiento/ProductoGenerico?id=${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            }
        });
        if (!response.ok) {
            throw new Error("Error al eliminar el producto generico");
        }
        return await response.json();
    } catch (error) {
        console.error("Error deleting producto generico:", error);
        throw error;
    }
};