import { API_ENDPOINTS } from "@/services/apis/endpoints";
import { api } from "@/services/apis";



export async function uploadFile(file: File){
    await api.upload(API_ENDPOINTS.DOCUMENT.upload, file);
}
