"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ws_1 = require("ws");
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const userManger_1 = require("./manager/userManger");
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*"
}));
const server = http_1.default.createServer(app);
const wss = new ws_1.WebSocketServer({ server });
const userManager = new userManger_1.UserManager();
console.log("one time");
wss.on("connection", (ws) => {
    // console.log("this is the socket", socket);
    console.log("An user is connected");
    console.log("============");
    console.log("inside websocket two times time");
    // console.log(socket)
    ws.on("message", (data) => {
        let { event, name } = JSON.parse(data);
        if (event == "join" && name) {
            userManager.addUser(name, ws);
        }
    });
    ws.on("close", () => {
        console.log("user is disconnected");
    });
});
const port = process.env.PORT || 3000;
server.listen(port, () => {
    console.log(`server is listening on the http://localhost:${port}`);
});
