import { useMutation } from "@tanstack/react-query";
import { api, setAccessToken } from "@/lib/api";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import axios from "axios";
import { LoginFormData, RegisterFormData } from "./useAuthSchemas";

export function useAuthMutations(
  setIsSuccess: (val: boolean) => void,
  setIsLogin: (val: boolean) => void,
  resetForm: () => void
) {
  const { login } = useAuth();

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      // 1. Login to get the access token
      const response = await api.post("/auth/login", data);

      // The backend returns: { success: true, data: { access_token: "..." } }
      const token = response.data.data.access_token;

      // Temporarily set token to fetch user profile
      setAccessToken(token);

      // 2. Fetch the user profile using the new token
      const meResponse = await api.get("/auth/me");
      const user = meResponse.data.data;

      return { token, user };
    },
    onSuccess: (data) => {
      setIsSuccess(true);
      setTimeout(() => {
        login(data.token, data.user);
      }, 1500);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to login. Please check your credentials.");
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
      const payload = { ...data, timezone };
      const response = await api.post("/auth/register", payload);
      return response.data;
    },
    onSuccess: () => {
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setIsLogin(true); // Switch to login after successful register
        resetForm(); // Clear form
        toast.success("Account created successfully. Please sign in.");
      }, 2000);
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to register. Please try again.");
      }
    },
  });

  return { loginMutation, registerMutation };
}
