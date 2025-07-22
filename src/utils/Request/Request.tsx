const FILE_UPLOAD = {
  end_point: "/file/upload",
  headers: {
    "Content-Type": "multipart/form-data",
  },
};

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class Request {
  private axiosInstance: AxiosInstance;

  constructor(baseURL: string) {
    this.axiosInstance = axios.create({
      baseURL,
    });
  }

  private getHeaders(): Record<string, string> {
    return {
      "Content-Type": "application/json",
      // Add other headers as needed
    };
  }

  public async get<T>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.get(url, {
        headers: this.getHeaders(),
        ...config,
      });

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error in GET request:", error);

      return {
        success: false,
        error: "Error in GET request",
      };
    }
  }

  public async post<T>(
    url: string,
    data: any,
    config?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    try {
      const response: AxiosResponse<T> = await this.axiosInstance.post(
        url,
        data,
        {
          headers: this.getHeaders(),
          ...config,
        },
      );

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Error in POST request:", error);

      return {
        success: false,
        error: "Error in POST request",
      };
    }
  }
}

export default Request;
