const express = require("express");
require("dotenv").config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/public"));

const PORT = process.env.PORT || 3000;

const server = require("http").createServer(app);
const io = require("socket.io")(server);

server.listen(PORT, () => {
    console.log(`Listening on port: ${PORT}`);
});

app.get("/dashboard", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (client) => {
    console.log(`Connected to ${client.id}`);

    client.on('message', msg => {
        console.log(msg)
    })
});

async function invokeAI(data) {
    
}

