
import { v4 as uuidv4 } from 'uuid';
import { WebSocket } from "ws";
import { User } from "../utils/util";
import { RoomManager } from "./roomManager";


export class UserManager{
    private users:User[];
    private queue:string[];
    private roomManager:RoomManager;

    constructor(){
        this.users=[];
        this.queue=[];
        this.roomManager = new RoomManager();
    }


    addUser(name:string, socket:WebSocket){
        const userId =this.generateUniqueId();
        this.users.push({name,socket,id: userId});

        this.queue.push(userId);
        socket.send(JSON.stringify({event:"lobby"}));
        this.clearQueue();

        this.initHandler(socket,userId);

    }

    removeUser(userId:string){
        const user = this.users.find(user=>user.id===userId);

        if(!user){
            console.log("no user is found")
            return
        }
        this.users=this.users.filter(user=>user.id !== userId)
        this.queue=this.queue.filter(id=>id===userId)
    }


    clearQueue(){

        if(this.queue.length<2){
            return
        }

        const id1= this.queue.pop();
        const id2= this.queue.pop();

        const user1 =this.users.find(x=>x.id===id1);
        const user2 =this.users.find(x=>x.id===id2);
        if(!user1 || !user2){
            return
        }

        console.log("creating room");


        const room = this.roomManager.createRoom(user1,user2);
        this.clearQueue();
        // return room;
    }

    initHandler(socket:WebSocket,userId:string){
        socket.on("message",(data:string)=>{

            const {event, ...payload} = JSON.parse(data);


            // roomId:string, sdp:string, senderSocketId:string
            // onIceCandidate(roomId:string, senderSocketId:string, candidate:any,type:"sender" | "receiver")

            switch(event){
                case "offer":
                    this.roomManager.onOffer(payload.roomId, payload.sdp, userId,socket);
                    break;
                
                case "answer": 
                    // console.log("in the answer")
                    this.roomManager.onAnswer(payload.roomId,payload.sdp,userId,socket);
                    break;

                case "add-ice-candidate":
                    this.roomManager.onIceCandidate(payload.roomId,userId, payload.candidate, payload.target,socket);
                    break;
            }

            socket.on("close",()=>{
                this.removeUser(userId)
            })

        })
    }


    private generateUniqueId(): string {
        return uuidv4();
    }
}