import { WebSocket, WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors"
import { UserManager } from "./manager/userManger";

const app = express();
app.use(cors({
    origin:"*"
}))

const server = http.createServer(app);

const wss = new WebSocketServer({server});

const userManager = new UserManager();

console.log("one time");

wss.on("connection",(ws:WebSocket)=>{

    // console.log("this is the socket", socket);

    console.log("An user is connected");
    console.log("============")

    console.log("inside websocket two times time");
    // console.log(socket)
    ws.on("message", (data:string)=>{
        let {event, name} = JSON.parse(data);
        if(event == "join" && name){
            userManager.addUser(name,ws);
        }
    });

    ws.on("close",()=>{
        console.log("user is disconnected");
    })
})

const port = process.env.PORT || 3000
server.listen(port, ()=>{
    console.log(`server is listening on the http://localhost:${port}`)
})