import 'dotenv/config'
import connectDB from './db/index.js'
import { app } from './app.js'
import http from "http";
import { setupSocket } from "./chat/index.js";

const port = process.env.PORT || 8000

connectDB()
.then(() => {
    const server = http.createServer(app);
    setupSocket(server); // Attach Socket.IO

    server.listen(port, () => {
        console.log(` ⚙️    Server is running at port : ${port} \n`);
    })
})
.catch((err) => {
    console.log(" MONGO db connection failed : ", err);
})