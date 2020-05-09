import io from "socket.io-client";

export const socket = io.connect("192.168.1.66:3001");