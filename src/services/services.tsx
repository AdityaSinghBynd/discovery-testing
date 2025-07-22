import { BASE_URL } from "@/constant/constant";
import { FileUploadResponse, RootObject } from "@/interface/Response";
import axios, {
  AxiosProgressEvent,
  AxiosRequestConfig,
  AxiosResponse,
} from "axios";
import ApiService from "./service";
import { getSession, useSession } from "next-auth/react";
import { Session } from "next-auth";

interface LoginResponse {
  token: string;
}

const axiosInstance = axios.create({
  baseURL: BASE_URL,
});

export const Search = async (payload: Record<string, any>): Promise<any> => {
  const { pdfBlobUrls, query } = payload;

  if (pdfBlobUrls === undefined || query === undefined) {
    return;
  }

  const url = `${process.env.NEXT_PUBLIC_AZURE_FUNCTION_URL}?pdf_blob_urls=${encodeURIComponent(JSON.stringify(pdfBlobUrls))}&query=${encodeURIComponent(query)}`;

  try {
    const response = await axios.get(url, {
      headers: {
        "x-functions-key": process.env.NEXT_PUBLIC_AZURE_SEARCH_FUNCTION_KEY,
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error calling Azure Function:", error);
    throw error;
  }
};

export const PostFile = async (
  payload: FormData,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<any> => {
  const session = await getSession();
  const headers = {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${session?.accessToken}`,
  };

  try {
    const config: AxiosRequestConfig = {
      headers,
      onUploadProgress,
    };

    const response: AxiosResponse<FileUploadResponse> =
      await axiosInstance.post("/documents/upload", payload, config);

    if (response.status === 201) {
      return response.data;
    }

    return response.data;
  } catch (error) {
    console.error("Server Not Responding!", error);
    return null;
  }
};

export const PostDocument = async (
  payload: Record<string, any>,
  onUploadProgress?: (progressEvent: AxiosProgressEvent) => void,
): Promise<any> => {
  const token = await ApiService.getToken();

  const headers = {
    "Content-Type": "multipart/form-data",
    Authorization: `Bearer ${token}`,
  };

  try {
    const config: AxiosRequestConfig = {
      headers,
      onUploadProgress,
    };

    const response: AxiosResponse<FileUploadResponse> =
      await axiosInstance.post("/documents/upload", payload, config);
    if (response.status === 201) {
      return response;
    }
    return null;
  } catch (error) {
    console.error("Server Not Responding!", error);
    return false;
  }
};

export const UserUpdate = async (
  payload: Record<string, any>,
): Promise<Record<string, any>> => {
  const { firstName, lastName, userId } = payload;
  try {
    const response: AxiosResponse<any> = await axiosInstance.post(
      `/user/user/${userId}/update/`,
      { first_name: firstName, last_name: lastName },
    );

    return response.data;
  } catch (error) {
    console.error("Login failed", error);
    return {
      message: "Internal Server Error",
      status: 401,
    };
  }
};

export const DeleteProject = async (
  payload: Record<string, any>,
): Promise<Record<string, any>> => {
  const { projectId } = payload;
  try {
    const response: AxiosResponse<any> = await axiosInstance.delete(
      `/project/${projectId}/delete/`,
    );

    return response.data;
  } catch (error) {
    console.error("Failed while delete the project", error);
    return {
      message: "Internal Server Error",
      status: 401,
    };
  }
};

export const updateProject = async (
  projectId: number,
  name: string,
  description: string,
) => {
  try {
    const response: AxiosResponse<any> = await axiosInstance.put(
      `/project/${projectId}/edit/`,
      { project_name: name, description: description },
    );
    return response.data;
  } catch (error) {
    throw new Error("Failed to update project");
  }
};

export const DeleteDocument = async (
  payload: Record<string, any>,
): Promise<Record<string, any>> => {
  const { documentId } = payload;
  try {
    const response: AxiosResponse<any> = await axiosInstance.delete(
      `/document/${documentId}/delete/`,
    );
    return response.data;
  } catch (error) {
    console.error("Failed while delete the project", error);
    return {
      message: "Internal Server Error",
      status: 401,
    };
  }
};

export const addElement = async (workspaceId: any, element: any) => {
  try {
    const response = await axios.post(`${BASE_URL}/element/api/add-element/`, {
      workspaceId,
      elementType: element.elementType,
      content: element.content,
      pageNumber: element.pageNumber,
      contentTitle: element.contentTitle,
      aiSummary: element.aiSummary,
      imageCaption: element.imageCaption,
    });

    return response.data;
  } catch (error) {
    console.error("Error adding element:", error);
    throw error;
  }
};
