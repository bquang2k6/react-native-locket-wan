import { io, Socket } from "socket.io-client";
import { API_URL } from "./api";

let socketInstance: Socket | null = null;

function getBaseWsUrl(): string {
    // Extract base URL from API_URL - it already has wss:// protocol from createWsUrlString
    const fullUrl = String(API_URL.GET_All_MESSAGE);
    console.log("🔌 Full WebSocket URL:", fullUrl);

    // Extract just the base (e.g., "wss://wslocketwan.wibu.life")
    const match = fullUrl.match(/(wss?:\/\/[^\/]+)/);
    const baseUrl = match ? match[1] : "wss://wslocketwan.wibu.life";

    console.log("🔌 Base WebSocket URL:", baseUrl);
    return baseUrl;
}

export function getSocket(): Socket {
    if (socketInstance && socketInstance.connected) return socketInstance;

    if (!socketInstance) {
        socketInstance = io(`${getBaseWsUrl()}/chat`, {
            transports: ["websocket", "polling"],
            autoConnect: true,
            reconnection: true,
            reconnectionAttempts: Infinity,
            reconnectionDelay: 500,
            reconnectionDelayMax: 3000,
        });
    } else if (!socketInstance.connected) {
        socketInstance.connect();
    }

    return socketInstance;
}

export function onNewListMessages(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on("new_on_list_message", callback);
    return () => socket.off("new_on_list_message", callback);
}

export function onNewMessagesWithUser(callback: (data: any) => void): () => void {
    const socket = getSocket();
    socket.on("new_message_with_user", callback);
    return () => socket.off("new_message_with_user", callback);
}

export function emitGetListMessages({ timestamp = null, token }: { timestamp: number | null; token: string }): void {
    const socket = getSocket();
    socket.emit("get_list_message", { timestamp, token });
}

export function emitGetMessagesWithUser({
    messageId,
    timestamp = null,
    token
}: {
    messageId: string;
    timestamp: number | null;
    token: string
}): void {
    const socket = getSocket();
    socket.emit("get_messages_with_user", { messageId, timestamp, token });
}

export function disconnectSocket(): void {
    if (socketInstance) {
        socketInstance.disconnect();
    }
}
