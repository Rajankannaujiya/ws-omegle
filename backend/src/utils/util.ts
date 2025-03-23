
import { WebSocket } from "ws";
export interface User{
    id:string,
    name:string,
    socket:WebSocket,
}

export interface Room{
    user1:User,
    user2:User
}