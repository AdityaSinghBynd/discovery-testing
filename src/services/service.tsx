import axios, {
  AxiosInstance,
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import { getSession, signOut } from "next-auth/react";
import { BASE_URL } from "@/constant/constant";
import { refreshSession } from "./tokenRefresh";

export class ApiService {
  private static axiosInstance: AxiosInstance;

  public static initialize() {
    if (!this.axiosInstance) {
      this.axiosInstance = axios.create({
        baseURL: `${BASE_URL}`,
        timeout: 300000,
      });
    }
  }

  public static async getToken(): Promise<string | null> {
    try {
      const session = await getSession();
      return session?.accessToken ?? null;
    } catch (error) {
      console.error("Failed to retrieve session:", error);
      return null;
    }
  }

  /**
   *
   * @param {string} method - The HTTP method to use (e.g., 'get', 'post', 'put', 'delete').
   * @param {string} url - The endpoint URL to send the request to.
   * @param {object|null} data - The data to send with the request (for POST, PUT, PATCH).
   * @param {string|null} token - The token to include in the request headers (optional).
   * @param {Record<string, string>} headers - Additional headers to include in the request.
   * @param {boolean} useAuth - Flag to determine if the request should include an authorization header.
   * @returns {Promise<AxiosResponse<any>>} - The response data from the API.
   */
  public static async apiCall(
    method: string,
    url: string,
    data: any = null,
    token: string | null = null,
    headers: Record<string, string> = {},
    useAuth: boolean = true,
  ): Promise<AxiosResponse<any>> {
    this.initialize();

    try {
      if (useAuth) {
        if (!token) {
          token = await this.getToken();
        }
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
      }

      const config: AxiosRequestConfig = {
        method,
        url,
        data,
        headers: {
          ...headers,
        },
      };

      const response = await this.axiosInstance(config);
      return response;
    } catch (error: any) { 

      if (error.response.status === 401) {
        const newSession = await refreshSession();
        //if newSession is not null, then call the apiCall with the new session
        if (newSession) {
          return this.apiCall(method, url, data, newSession.accessToken, headers, useAuth);
        } else {
          //if newSession is null, then sign out
          await signOut();
        }
      }
      console.error("API call error:");
      throw error;
    }
  }

  /**
   * Uploads a file using axios.
   *
   * @param {string} url - The endpoint URL to send the file to.
   * @param {File} file - The file to upload.
   * @param {(progressEvent: AxiosProgressEvent) => void} [onUploadProgress] - Callback for upload progress.
   * @returns {Promise<any>} - The response data from the upload.
   */
  public static async uploadFile(
    url: string,
    file: File,
    onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
  ): Promise<any> {
    this.initialize();
    try {
      const formData = new FormData();
      formData.append("file", file);

      const token = await this.getToken();
      const response = await this.axiosInstance.post(url, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        onUploadProgress,
      });

      return response.data;
    } catch (error) {
      console.error("File upload error:", error);
      throw error;
    }
  }
}

export default ApiService;
