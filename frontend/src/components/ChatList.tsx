import { useQueryClient } from "@tanstack/react-query";
import { MessageSquareText, Trash } from "lucide-react";
import { deleteChat } from "@/services/apis/api";

type ChatListProps = {
    chatId: string | null, 
    chats: any[],
    openChat: (chatId: string)=>void,
    loadingChats: boolean,
    searchKeyword: string
}

export default function ChatList({ chatId, chats, openChat, loadingChats, searchKeyword }: ChatListProps){
    const queryClient = useQueryClient();

    async function removeChat(chatId: string){
        await deleteChat(chatId);
        await queryClient.invalidateQueries({ queryKey: ["chats"] });
    }
    return (
    <div className="mt-3 max-h-64 space-y-1 overflow-y-auto">
          {chats?.map((c) => (
            <>
            <div
              key={c.id}
              className={`relative flex group justify-between w-full items-center gap-2 border border-gray-400 rounded-sm px-2 py-1.5 text-left text-sm hover:bg-muted ${c.id === chatId ? "bg-primary text-muted font-medium" : ""}`}
            >
                <div className="flex items-center gap-2 cursor-pointer w-full" onClick={() => openChat(c.id)}>
                    <MessageSquareText  className="size-3.5 shrink-0" />
                    <span className="w-[80%] truncate">{c.title}</span>
                </div>
                <button 
                 onClick={()=>removeChat(c?.id)} 
                 className="absolute z-2 right-2 hidden items-center gap-2 group-hover:flex">
                    <Trash className="size-3.5 shrink-0"/>
                </button>
            </div>
            </>
          ))}
          {!chats.length && !loadingChats && (
            <p className="px-2 text-xs text-muted-foreground">
              {searchKeyword.trim() ? "No chats match your search." : "No chats yet."}
            </p>
          )}
        </div>
    )
}