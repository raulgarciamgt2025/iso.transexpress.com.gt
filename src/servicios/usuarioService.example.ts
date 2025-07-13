// Example of how to refactor service providers to use the new API client
// This shows the pattern for updating existing providers

import apiClient, { ApiResponse } from '@/helpers/apiClient';
import { handleError } from '@/utils/errorHandler';

export interface Usuario {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  updated_at?: string;
}

interface CreateUsuarioRequest {
  name: string;
  email: string;
  password: string;
  id_empresa: number;
}

interface UpdateUsuarioRequest extends Partial<CreateUsuarioRequest> {
  id: number;
}

class UsuarioService {
  private static readonly ENDPOINT_BASE = 'usuarios';

  // Fetch all users
  static async fetchAll(): Promise<Usuario[]> {
    try {
      const response = await apiClient.get<Usuario[]>(this.ENDPOINT_BASE);
      return Array.isArray(response.data) ? response.data : [];
    } catch (error) {
      handleError(error, { context: 'UsuarioService.fetchAll' });
      return []; // Return empty array as fallback
    }
  }

  // Fetch user by ID
  static async fetchById(id: number): Promise<Usuario | null> {
    try {
      const response = await apiClient.get<Usuario>(`${this.ENDPOINT_BASE}/${id}`);
      return response.data;
    } catch (error) {
      handleError(error, { context: `UsuarioService.fetchById(${id})` });
      return null;
    }
  }

  // Create new user
  static async create(userData: CreateUsuarioRequest): Promise<ApiResponse<Usuario>> {
    try {
      const response = await apiClient.post<Usuario>(this.ENDPOINT_BASE, userData);
      return response;
    } catch (error) {
      handleError(error, { 
        context: 'UsuarioService.create',
        display: true,
        displayOptions: { title: 'Error al crear usuario' }
      });
      throw error; // Re-throw for component handling
    }
  }

  // Update existing user
  static async update(userData: UpdateUsuarioRequest): Promise<ApiResponse<Usuario>> {
    try {
      const { id, ...updateData } = userData;
      const response = await apiClient.put<Usuario>(`${this.ENDPOINT_BASE}/${id}`, updateData);
      return response;
    } catch (error) {
      handleError(error, { 
        context: `UsuarioService.update(${userData.id})`,
        display: true,
        displayOptions: { title: 'Error al actualizar usuario' }
      });
      throw error;
    }
  }

  // Delete user
  static async delete(id: number): Promise<ApiResponse<any>> {
    try {
      const response = await apiClient.delete<any>(`${this.ENDPOINT_BASE}/${id}`);
      return response;
    } catch (error) {
      handleError(error, { 
        context: `UsuarioService.delete(${id})`,
        display: true,
        displayOptions: { title: 'Error al eliminar usuario' }
      });
      throw error;
    }
  }
}

// Export both class and individual functions for flexibility
export default UsuarioService;

// Legacy function exports for backward compatibility
export const fetchUsuario = UsuarioService.fetchAll;
export const fetchUsuarioById = UsuarioService.fetchById;
export const createUsuario = UsuarioService.create;
export const updateUsuario = UsuarioService.update;
export const deleteUsuario = UsuarioService.delete;
