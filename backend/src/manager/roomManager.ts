import { WebSocket } from "ws";
import { v4 as uuidv4 } from 'uuid';
import { Room, User } from "../utils/util";


export class RoomManager{
    

    private rooms: Map<string, Room>

    constructor(){
        this.rooms= new Map<string, Room>();
    }

    createRoom(user1:User, user2:User){
        const roomId = this.generateUniqueId().toString();

        // console.log("createroom",roomId)

        this.rooms.set(roomId.toString(),{
            user1,
            user2
        })

        user1.socket.send(JSON.stringify({event:"send-offer", roomId}))
        user2.socket.send(JSON.stringify({event:"send-offer", roomId}))

        return roomId;
    }


    onOffer(roomId:string, sdp:string, senderId:string,socket:WebSocket){

        const room = this.rooms.get(roomId);
        console.log("room id of onOffer fun", room)

        if(!room || !socket){
            return
        }

        const recievedUser = room.user1.id === senderId? room.user2 : room.user1;

        recievedUser.socket.send(JSON.stringify({event:"offer", sdp, roomId}));
    }


    onAnswer(roomId:string, sdp:string, senderId:string, socket:WebSocket){
        // console.log( "in the answer function")
        const room = this.rooms.get(roomId);
        console.log("this is the onAnswer room",room)

        if(!room || !socket){
            return
        }

        console.log("before recievedUser")
        const recievedUser = room.user1.id === senderId? room.user2 : room.user1;
        console.log("onAnswer", recievedUser)
        recievedUser.socket.send(JSON.stringify({event:"answer", sdp,roomId})); 
    }

    onIceCandidate(roomId:string, senderId:string, candidate:any,target:"sender" | "receiver", socket:WebSocket){

        const room = this.rooms.get(roomId);
        console.log("onicecandidate room",room)

        if(!room || !socket){
            return
        }

        const recievedUser= room.user1.id === senderId ? room.user2 :room.user1;

        recievedUser.socket.send(JSON.stringify({event:"add-ice-candidate", candidate,target}))


    }


    private generateUniqueId(): string {
        return uuidv4();
    }

}

