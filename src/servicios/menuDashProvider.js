import { API_URL } from "configs/apiConfig";
import TableIcon from 'assets/nav-icons/table.svg?react';

export const fetchMenuDashboard = async () => {

    try {
        const response = await fetch(`${API_URL}Usuario/Modulo/${sessionStorage.getItem("login_usuario")}`);
        const data = await response.json();
        return data.data;
    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
};

export const fetchMenuOpcionDashboard = async () => {
    try {
        const response = await fetch(`${API_URL}Usuario/Opcion/${sessionStorage.getItem("login_usuario")}`);

        const data = await response.json();
        return data.data;

    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
};

export const getIconByName = (iconName) => {
    const icons = {
        TableIcon
    };

    return icons[iconName] || null;
};