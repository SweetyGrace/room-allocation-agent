import { io } from 'socket.io-client';

const URL = "wss://api.infinipws.divami.com/"

export const socket = io(URL, {
    autoConnect: false
});
