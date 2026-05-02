import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.EXPO_PUBLIC_NODE_API_URL ||
  'http://localhost:8000';

const TOKEN_STORAGE_KEY = '@RxScan:accessToken';

class PrescriptionStorageService {
  private async tokenHeaders(): Promise<Headers> {
    const headers = new Headers();
    const token = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  }

  async uploadWithPresignedUrl(fileUri: string, fileName?: string) {
    const result = await this.uploadViaBackend(fileUri, fileName);
    return result.fileUrl;
  }

  async uploadViaBackend(
    fileUri: string,
    fileName?: string
  ): Promise<{
    fileUrl: string;
    key: string;
    size: number;
    driveFileId?: string;
  }> {
    const formData = new FormData();
    formData.append('file', {
      uri: fileUri,
      type: 'image/jpeg',
      name: fileName || `prescription_${Date.now()}.jpg`,
    } as any);

    const response = await fetch(`${API_URL}/api/prescription/upload`, {
      method: 'POST',
      headers: await this.tokenHeaders(),
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || `Upload failed: ${response.status}`);
    }

    return result.data;
  }

  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${API_URL}/api/drive/files/${encodeURIComponent(fileId)}`,
        {
          method: 'DELETE',
          headers: await this.tokenHeaders(),
        }
      );

      return response.ok;
    } catch (error) {
      return false;
    }
  }
}

export default new PrescriptionStorageService();
