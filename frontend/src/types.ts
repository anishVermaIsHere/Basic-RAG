export type Source={id:string;title:string;snippet?:string;content?:string;page?:number;score?:number|null;url?:string;chunk_index?:number;document_id?:string;chat_id?:string;chat_title?:string;message_id?:string;created_at?:string};
export type SourceStat={document_id:string;title:string;citations:number};
export type Message={id:string;role:"user"|"assistant";content:string;createdAt:string;sources?:Source[]};
export type ChatSummary={id:string;title:string;created_at:string};
export type Doc={id:string;name:string;type:string;size:number;status:"ready"|"processing"|"failed";chunks?:number;createdAt:string};
export type Collection={id:string;name:string;description?:string;documentCount:number};
export type Status = "pending" | "uploading" | "done" | "error";
export type Item = { id: string; file: File; status: Status };
