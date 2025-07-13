import apiClient from "helpers/apiClient";
import TableIcon from 'assets/nav-icons/table.svg?react';

export const fetchMenuDashboard = async () => {

    try {
        const response = await apiClient.get(`Usuario/Modulo/${sessionStorage.getItem("login_usuario")}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching menu:", error);
        throw error;
    }
};

export const fetchMenuOpcionDashboard = async () => {
    try {
        const response = await apiClient.get(`Usuario/Opcion/${sessionStorage.getItem("login_usuario")}`);

        return response.data.data;

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