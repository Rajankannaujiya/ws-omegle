"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManager = void 0;
const uuid_1 = require("uuid");
const roomManager_1 = require("./roomManager");
class UserManager {
    constructor() {
        this.users = [];
        this.queue = [];
        this.roomManager = new roomManager_1.RoomManager();
    }
    addUser(name, socket) {
        const userId = this.generateUniqueId();
        this.users.push({ name, socket, id: userId });
        this.queue.push(userId);
        socket.send(JSON.stringify({ event: "lobby" }));
        this.clearQueue();
        this.initHandler(socket, userId);
    }
    removeUser(userId) {
        const user = this.users.find(user => user.id === userId);
        if (!user) {
            console.log("no user is found");
            return;
        }
        this.users = this.users.filter(user => user.id !== userId);
        this.queue = this.queue.filter(id => id === userId);
    }
    clearQueue() {
        if (this.queue.length < 2) {
            return;
        }
        const id1 = this.queue.pop();
        const id2 = this.queue.pop();
        const user1 = this.users.find(x => x.id === id1);
        const user2 = this.users.find(x => x.id === id2);
        if (!user1 || !user2) {
            return;
        }
        console.log("creating room");
        const room = this.roomManager.createRoom(user1, user2);
        this.clearQueue();
        // return room;
    }
    initHandler(socket, userId) {
        socket.on("message", (data) => {
            const _a = JSON.parse(data), { event } = _a, payload = __rest(_a, ["event"]);
            // roomId:string, sdp:string, senderSocketId:string
            // onIceCandidate(roomId:string, senderSocketId:string, candidate:any,type:"sender" | "receiver")
            switch (event) {
                case "offer":
                    this.roomManager.onOffer(payload.roomId, payload.sdp, userId, socket);
                    break;
                case "answer":
                    // console.log("in the answer")
                    this.roomManager.onAnswer(payload.roomId, payload.sdp, userId, socket);
                    break;
                case "add-ice-candidate":
                    this.roomManager.onIceCandidate(payload.roomId, userId, payload.candidate, payload.target, socket);
                    break;
            }
            socket.on("close", () => {
                this.removeUser(userId);
            });
        });
    }
    generateUniqueId() {
        return (0, uuid_1.v4)();
    }
}
exports.UserManager = UserManager;
