import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserHealthProfile } from '@/context/UserHealthContext';
import { MedicineSearchResult, PrescriptionData } from '@/types/prescription';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_NODE_API_URL ||
  'http://localhost:8000';

const TOKEN_STORAGE_KEY = '@RxScan:accessToken';

type PrescriptionStatus = 'active' | 'inactive' | 'abandoned' | 'completed';

interface ApiUser {
  $id: string;
  email: string;
  name: string;
  emailVerification: boolean;
  registration: string;
}

type ApiDocument = Record<string, any>;

class RxScanApiService {
  private async getToken(): Promise<string | null> {
    return AsyncStorage.getItem(TOKEN_STORAGE_KEY);
  }

  private async setToken(token: string): Promise<void> {
    await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
  }

  private async clearToken(): Promise<void> {
    await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
    requireAuth = true
  ): Promise<T> {
    const headers = new Headers(options.headers);

    if (!(options.body instanceof FormData) && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    if (requireAuth) {
      const token = await this.getToken();
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';
    const payload = contentType.includes('application/json')
      ? await response.json()
      : await response.text();

    if (!response.ok) {
      const message =
        typeof payload === 'object' && payload !== null && 'error' in payload
          ? String((payload as { error: unknown }).error)
          : `Request failed with status ${response.status}`;
      throw new Error(message);
    }

    return payload as T;
  }

  async createAccount(email: string, password: string, name?: string): Promise<ApiUser> {
    const response = await this.request<{ access_token: string; user: unknown }>(
      '/api/auth/signup',
      {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      },
      false
    );
    await this.setToken(response.access_token);
    return response.user as ApiUser;
  }

  async signIn(email: string, password: string): Promise<{ access_token: string; user: ApiUser }> {
    const response = await this.request<{ access_token: string; user: ApiUser }>(
      '/api/auth/signin',
      {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      },
      false
    );
    await this.setToken(response.access_token);
    return response;
  }

  async getCurrentUser(): Promise<ApiUser | null> {
    const token = await this.getToken();
    if (!token) {
      return null;
    }

    try {
      return await this.request<ApiUser>('/api/auth/me');
    } catch (error) {
      await this.clearToken();
      return null;
    }
  }

  async signOut() {
    await this.clearToken();
    return true;
  }

  async createUserProfile(userId: string, data: any): Promise<ApiDocument> {
    return this.request<ApiDocument>('/api/users/me/profile', {
      method: 'PUT',
      body: JSON.stringify({ userId, ...data }),
    });
  }

  async getUserProfile(_userId: string): Promise<{ documents: ApiDocument[] }> {
    const profile = await this.request<ApiDocument | null>('/api/users/me/profile');
    return profile ? { documents: [profile] } : { documents: [] };
  }

  async uploadImage(fileUri: string, fileName?: string): Promise<string | null> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: fileName || `image_${Date.now()}.jpg`,
    } as any);

    const result = await this.request<{
      data: { key: string };
    }>('/api/prescriptions/upload', {
      method: 'POST',
      body: formData,
    });

    return result.data.key;
  }

  getImageUrl(fileIdOrUrl: string): string {
    return fileIdOrUrl;
  }

  getImageDownloadUrl(fileIdOrUrl: string): string {
    return fileIdOrUrl;
  }

  async deleteImage(fileId: string): Promise<boolean> {
    try {
      await this.request(`/api/drive/files/${encodeURIComponent(fileId)}`, {
        method: 'DELETE',
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async getImageFile(fileId: string) {
    return { $id: fileId };
  }

  async createHealthProfile(userId: string, healthProfile: UserHealthProfile) {
    return this.createOrUpdateHealthProfile(userId, healthProfile);
  }

  async updateHealthProfile(_documentId: string, healthProfile: UserHealthProfile) {
    return this.request('/api/health-profile', {
      method: 'PUT',
      body: JSON.stringify(healthProfile),
    });
  }

  async getHealthProfile(_userId: string): Promise<ApiDocument | null> {
    return this.request<ApiDocument | null>('/api/health-profile');
  }

  async createOrUpdateHealthProfile(
    _userId: string,
    healthProfile: UserHealthProfile
  ): Promise<ApiDocument> {
    return this.request<ApiDocument>('/api/health-profile', {
      method: 'PUT',
      body: JSON.stringify(healthProfile),
    });
  }

  async deleteHealthProfile(_userId: string): Promise<ApiDocument> {
    return this.request<ApiDocument>('/api/health-profile', {
      method: 'DELETE',
    });
  }

  async createPrescription(
    _userId: string,
    ocrResult: PrescriptionData,
    searchResult: MedicineSearchResult,
    image: string,
    key: string
  ): Promise<ApiDocument> {
    return this.request<ApiDocument>('/api/prescriptions', {
      method: 'POST',
      body: JSON.stringify({
        ocrResult,
        searchResult,
        image,
        object_key: key,
      }),
    });
  }

  async getPrescriptions(_userId: string): Promise<ApiDocument[]> {
    return this.request<ApiDocument[]>('/api/prescriptions');
  }

  async deletePrescription(prescriptionId: string): Promise<ApiDocument> {
    return this.request<ApiDocument>(`/api/prescriptions/${encodeURIComponent(prescriptionId)}`, {
      method: 'DELETE',
    });
  }

  async changePrescriptionStatus(
    prescriptionId: string,
    status: PrescriptionStatus
  ): Promise<ApiDocument> {
    return this.request<ApiDocument>(
      `/api/prescriptions/${encodeURIComponent(prescriptionId)}/status`,
      {
      method: 'PATCH',
      body: JSON.stringify({ status }),
      }
    );
  }
}

const rxScanApiService = new RxScanApiService();

export default rxScanApiService;
export { API_URL };
