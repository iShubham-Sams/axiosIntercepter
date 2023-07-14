import axios, { AxiosError } from "axios";
import { getAccessToken } from "../getAccessToken";

const axiosBaseHttpClient = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

export const axiosClientForLogIn = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
  withCredentials: true,
});

const handleError = async (error: any) => {
  if (error instanceof AxiosError && error.config) {
    const response = error.response;
    const originalRequestConfig: any = error.config;
    if (
      error.config?.url?.includes("login") ||
      error.config.url?.includes("logout") ||
      error.config.url?.includes("profile")
    ) {
      throw error;
    }
    if (response && response.status >= 500) {
      window.location.href = "/login";
      return;
    }
    if (response?.status === 401 && !originalRequestConfig._retry) {
      originalRequestConfig._retry = true;
      const tokenResponse = await getAccessToken();
      if (tokenResponse === false) {
        throw error;
      } else {
        if (tokenResponse) {
          if (tokenResponse.status === 401) {
            window.location.href = "/login";
            return;
          } else {
            return axios.request(originalRequestConfig);
          }
        } else {
          throw error;
        }
      }
    } else {
      throw error;
    }
  }
  throw error;
};

axiosBaseHttpClient.interceptors.response.use(async (response) => {
  return response;
}, handleError);

export default axiosBaseHttpClient;
