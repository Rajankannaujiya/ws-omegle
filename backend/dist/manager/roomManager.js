"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomManager = void 0;
const uuid_1 = require("uuid");
class RoomManager {
    constructor() {
        this.rooms = new Map();
    }
    createRoom(user1, user2) {
        const roomId = this.generateUniqueId().toString();
        // console.log("createroom",roomId)
        this.rooms.set(roomId.toString(), {
            user1,
            user2
        });
        user1.socket.send(JSON.stringify({ event: "send-offer", roomId }));
        user2.socket.send(JSON.stringify({ event: "send-offer", roomId }));
        return roomId;
    }
    onOffer(roomId, sdp, senderId, socket) {
        const room = this.rooms.get(roomId);
        console.log("room id of onOffer fun", room);
        if (!room || !socket) {
            return;
        }
        const recievedUser = room.user1.id === senderId ? room.user2 : room.user1;
        recievedUser.socket.send(JSON.stringify({ event: "offer", sdp, roomId }));
    }
    onAnswer(roomId, sdp, senderId, socket) {
        // console.log( "in the answer function")
        const room = this.rooms.get(roomId);
        console.log("this is the onAnswer room", room);
        if (!room || !socket) {
            return;
        }
        console.log("before recievedUser");
        const recievedUser = room.user1.id === senderId ? room.user2 : room.user1;
        console.log("onAnswer", recievedUser);
        recievedUser.socket.send(JSON.stringify({ event: "answer", sdp, roomId }));
    }
    onIceCandidate(roomId, senderId, candidate, target, socket) {
        const room = this.rooms.get(roomId);
        console.log("onicecandidate room", room);
        if (!room || !socket) {
            return;
        }
        const recievedUser = room.user1.id === senderId ? room.user2 : room.user1;
        recievedUser.socket.send(JSON.stringify({ event: "add-ice-candidate", candidate, target }));
    }
    generateUniqueId() {
        return (0, uuid_1.v4)();
    }
}
exports.RoomManager = RoomManager;
