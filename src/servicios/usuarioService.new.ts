// Example service provider using the new API client with session expiration handling
import apiClient from '@/helpers/apiClient';
import { handleError } from '@/utils/errorHandler';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  active?: boolean;
  created_at?: string;
  updated_at?: string;
}

interface ApiResponse<T> {
  estado: boolean;
  mensaje: string;
  data: T;
  errores?: Record<string, string>;
}

/**
 * New Usuario Service with automatic session expiration handling
 * This service demonstrates the proper pattern for handling API calls
 * with automatic logout when sessions expire.
 */
class UsuarioService {
  private static readonly ENDPOINT_BASE = 'usuarios';

  /**
   * Fetch all usuarios
   * Automatically handles session expiration
   */
  static async fetchAll(): Promise<Usuario[]> {
    try {
      const response = await apiClient.get<Usuario[]>(this.ENDPOINT_BASE);
      return response.data || [];
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.fetchAll',
        display: false // Let the UI component decide whether to show the error
      });
      return [];
    }
  }

  /**
   * Fetch usuario by ID
   * @param id Usuario ID
   */
  static async fetchById(id: number | string): Promise<Usuario | null> {
    try {
      const response = await apiClient.get<Usuario>(`${this.ENDPOINT_BASE}/${id}`);
      return response.data || null;
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.fetchById',
        display: false
      });
      return null;
    }
  }

  /**
   * Create new usuario
   * @param usuario Usuario data without ID
   */
  static async create(usuario: Omit<Usuario, 'id'>): Promise<ApiResponse<Usuario>> {
    try {
      const response = await apiClient.post<Usuario>(this.ENDPOINT_BASE, usuario);
      return response;
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.create',
        display: true, // Show error for create operations
        displayOptions: { title: 'Error al crear usuario' }
      });
      return { 
        estado: false, 
        mensaje: 'Error al crear el usuario', 
        data: null as any 
      };
    }
  }

  /**
   * Update existing usuario
   * @param usuario Usuario data with ID
   */
  static async update(usuario: Usuario): Promise<ApiResponse<Usuario>> {
    try {
      const response = await apiClient.put<Usuario>(
        `${this.ENDPOINT_BASE}/${usuario.id}`, 
        usuario
      );
      return response;
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.update',
        display: true,
        displayOptions: { title: 'Error al actualizar usuario' }
      });
      return { 
        estado: false, 
        mensaje: 'Error al actualizar el usuario', 
        data: null as any 
      };
    }
  }

  /**
   * Delete usuario
   * @param id Usuario ID
   */
  static async delete(id: number | string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete<any>(`${this.ENDPOINT_BASE}/${id}`);
      return response;
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.delete',
        display: true,
        displayOptions: { title: 'Error al eliminar usuario' }
      });
      return { 
        estado: false, 
        mensaje: 'Error al eliminar el usuario', 
        data: null 
      };
    }
  }

  /**
   * Update usuario password
   * @param id Usuario ID
   * @param password New password
   */
  static async updatePassword(id: number | string, password: string): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.put<any>(
        `${this.ENDPOINT_BASE}/${id}/password`, 
        { password }
      );
      return response;
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.updatePassword',
        display: true,
        displayOptions: { title: 'Error al actualizar contraseña' }
      });
      return { 
        estado: false, 
        mensaje: 'Error al actualizar la contraseña', 
        data: null 
      };
    }
  }

  /**
   * Search usuarios with filters
   * @param filters Search filters
   */
  static async search(filters: {
    name?: string;
    email?: string;
    active?: boolean;
    page?: number;
    limit?: number;
  }): Promise<{ usuarios: Usuario[]; total: number }> {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const response = await apiClient.get<{
        usuarios: Usuario[];
        total: number;
      }>(`${this.ENDPOINT_BASE}/search?${queryParams.toString()}`);
      
      return response.data || { usuarios: [], total: 0 };
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.search',
        display: false
      });
      return { usuarios: [], total: 0 };
    }
  }
}

export default UsuarioService;

// Export individual methods for backwards compatibility if needed
export const {
  fetchAll: fetchUsuario,
  fetchById: fetchUsuarioById,
  create: createUsuario,
  update: updateUsuario,
  delete: deleteUsuario,
  updatePassword: updateUsuarioPassword,
  search: searchUsuarios,
} = UsuarioService;
