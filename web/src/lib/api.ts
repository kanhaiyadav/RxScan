import type { HealthProfile, Prescription, PrescriptionData, PrescriptionStatus, User } from "@/types/domain";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const TOKEN_KEY = "rxscan_access_token";

interface TokenResponse {
  access_token: string;
  user: User;
}

function getToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(path: string, options: RequestInit = {}, auth = true): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormData = options.body instanceof FormData;

  if (!isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (auth) {
    const token = getToken();
    if (token) headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const error = typeof payload === "object" && payload?.error ? payload.error : `Request failed with status ${response.status}`;
    throw new Error(String(error));
  }

  return payload as T;
}

export const api = {
  async signup(input: { name: string; email: string; password: string }) {
    const response = await request<TokenResponse>("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify(input),
    }, false);
    saveToken(response.access_token);
    return response.user;
  },

  async signin(input: { email: string; password: string }) {
    const response = await request<TokenResponse>("/api/auth/signin", {
      method: "POST",
      body: JSON.stringify(input),
    }, false);
    saveToken(response.access_token);
    return response.user;
  },

  async me() {
    if (!getToken()) return null;
    return request<User>("/api/auth/me");
  },

  async signout() {
    clearToken();
  },

  async getHealthProfile() {
    return request<HealthProfile | null>("/api/health-profile");
  },

  async saveHealthProfile(profile: HealthProfile) {
    return request<HealthProfile>("/api/health-profile", {
      method: "PUT",
      body: JSON.stringify(profile),
    });
  },

  async getPrescriptions() {
    return request<Prescription[]>("/api/prescriptions");
  },

  async createPrescription(input: {
    ocrResult: PrescriptionData;
    searchResult: Record<string, unknown>;
    image: string;
    object_key: string;
  }) {
    return request<Prescription>("/api/prescriptions", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  async updatePrescriptionStatus(id: string, status: PrescriptionStatus) {
    return request<Prescription>(`/api/prescriptions/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    });
  },

  async deletePrescription(id: string) {
    return request(`/api/prescriptions/${id}`, { method: "DELETE" });
  },

  async extractPrescription(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ success: boolean; data?: PrescriptionData; error?: string }>("/api/extract", {
      method: "POST",
      body: formData,
    });
  },

  async uploadPrescription(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    return request<{ success: boolean; data: { fileUrl: string; key: string; size: number; driveFileId: string } }>("/api/prescription/upload", {
      method: "POST",
      body: formData,
    });
  },

  async googleDriveAuthUrl() {
    return request<{ authorization_url: string; state: string }>("/api/google-drive/authorization-url", {
      method: "POST",
    });
  },

  async googleDriveStatus() {
    return request<{ connected: boolean; scopes: string[]; expires_at?: string }>("/api/google-drive/status");
  },
};

export { API_URL };
