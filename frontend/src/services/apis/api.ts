import { API_ENDPOINTS } from "@/services/apis/endpoints";
import { api } from "@/services/apis";



export async function authLogin(credentials: any){
   return await api.post<any>(API_ENDPOINTS.AUTH.login, credentials);
}

export async function authLogout(){
   return await api.post<any>(API_ENDPOINTS.AUTH.logout, null);
}
