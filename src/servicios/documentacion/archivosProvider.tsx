import { API_URL } from "../../configs/apiConfig";
import Swal from 'sweetalert2';

export interface Archivo {
    id_documento: number;
    id_configuracion: number;
    id_area: number;
    area: string;
    id_proceso: number;
    proceso: string;
    documento: string;
    estado: string;
    archivo: string;
    ruta: string;
    archivo_final?: string;
    ruta_final?: string;
    // Add other properties as needed based on API response
}

export interface ArchivosRequest {
    id_empresa: number;
    id_periodo: number;
    id_usuario_editor: number;
}

// Helper function to handle 401 unauthorized responses
const handle401Error = () => {
    Swal.fire({
        title: 'Sesión Inválida',
        text: 'Su sesión ha expirado o no es válida. Por favor, inicie sesión nuevamente.',
        icon: 'warning',
        confirmButtonText: 'Ir al Login',
        allowOutsideClick: false,
        allowEscapeKey: false,
    }).then(() => {
        // Clear session and redirect to login
        document.cookie = '_FLACTO_AUTH_KEY_=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        window.location.href = '/auth/login';
    });
};

export const fetchArchivos = async (request: ArchivosRequest, token: string): Promise<Archivo[]> => {
    try {
        const response = await fetch(`${API_URL}documentos/empresa-periodo-editor`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token || ''}`
            },
            body: JSON.stringify(request)
        });
        
        if (response.status === 401) {
            handle401Error();
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching archivos: ${response.statusText}`);
        }
        
        const data = await response.json();
        const archivos = Array.isArray(data) ? data : (data.data || []);
        
        // Convert string dates to Date objects
        return archivos.map((archivo: any) => ({
            ...archivo,
            fecha_elaboracion: archivo.fecha_elaboracion ? new Date(archivo.fecha_elaboracion) : new Date(),
            fecha_revision: archivo.fecha_revision ? new Date(archivo.fecha_revision) : new Date(),
            fecha_aprobacion: archivo.fecha_aprobacion ? new Date(archivo.fecha_aprobacion) : new Date()
        }));
    } catch (error) {
        console.error("Error fetching archivos:", error);
        return [];
    }
};

// Function to fetch periodos with estado='SI' for dropdown
export const fetchPeriodosActivos = async (token: string, empresa: number): Promise<any[]> => {
    try {
        const response = await fetch(`${API_URL}periodos/empresa/${empresa}`, {
            headers: { "Authorization": `Bearer ${token || ''}` }
        });
        
        if (response.status === 401) {
            handle401Error();
            return [];
        }
        
        if (!response.ok) {
            throw new Error(`Error fetching periodos: ${response.statusText}`);
        }
        
        const data = await response.json();
        const periodos = Array.isArray(data) ? data : (data.data || []);
        
        // Filter only active periods
        return periodos.filter((periodo: any) => periodo.estado === 'SI');
    } catch (error) {
        console.error("Error fetching periodos activos:", error);
        return [];
    }
};
