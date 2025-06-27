import { API_URL } from "../configs/apiConfig";
import CryptoJS from "crypto-js";

export interface Usuario {
    id_usuario: number;
    login_usuario: string;
    nombre_usuario: string;
    email: string;
    contrasena: string;
}

interface ApiResponse<T> {
    data: T;
    [key: string]: any;
}

export const fetchUsuario = async (token): Promise<Usuario[]> => {
    try {
        const response = await fetch(`${API_URL}Usuario`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        const data: ApiResponse<Usuario[]> = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching usuario:", error);
        throw error;
    }
};

export const fetchUsuarioById = async (id: number | string, token): Promise<Usuario> => {
    try {
        const response = await fetch(`${API_URL}Usuario/${id}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        if (!response.ok) {
            throw new Error(`Error fetching opcion with id ${id}: ${response.statusText}`);
        }
        const data: ApiResponse<Usuario> = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching usuario by ID:", error);
        throw error;
    }
};

export const createUsuario = async (usuario: Usuario, token): Promise<any> => {
    if (usuario.contrasena) {
        usuario.contrasena = CryptoJS.SHA1(usuario.contrasena).toString();
    }

    try {
        const response = await fetch(`${API_URL}Usuario`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(usuario),
        });
        return await response.json();
    } catch (error) {
        console.error("Error creating usuario:", error);
        throw error;
    }
};

export const updateUsuario = async (usuario: Usuario, token): Promise<any> => {

    if (usuario.contrasena) {
        usuario.contrasena = CryptoJS.SHA1(usuario.contrasena).toString();
    }

    try {
        const response = await fetch(`${API_URL}Usuario`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(usuario),
        });
        return await response.json();
    } catch (error) {
        console.error("Error updating Usuario:", error);
        throw error;
    }
};

export const deleteUsuario = async (id: number | string, token): Promise<any> => {
    try {
        const response = await fetch(`${API_URL}Usuario?id=${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error deleting Usuario:", error);
        throw error;
    }
};
