import { API_ENDPOINTS } from "@/services/apis/endpoints";
import { api } from "@/services/apis";

const { DOCUMENT } = API_ENDPOINTS;

export async function uploadFile(file: File){
    await api.upload<any>(DOCUMENT.upload, file);
}

export async function fetchDocuments(){
    return await api.get<any[]>(DOCUMENT.all)    
}

export async function deleteDocument(documentId: string){
    return await api.del(DOCUMENT.one(documentId));
}

export async function renameDocumentName(documentId: string, filename: any){
    return await api.patch(DOCUMENT.one(documentId), { filename });
}