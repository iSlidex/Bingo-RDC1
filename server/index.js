const http = require("http");

const port = 3000;

const server = http.createServer((req, res) => {
    res.statusCode = 200;
    res.setHeader("Content-Type", "text/plain");
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:8081");
    res.setHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.setHeader("Access-Control-Allow-Credentials", "true");

    res.end("Hola Mundo\n");
});

const io = require("socket.io")(server);
io.on("connection", (socket) => {
    console.log("a user connected");
    socket.emit("success");

    socket.on("emit_nombre", (data) => {
        console.log("Nombre set ", data);
        socket.emit("success");
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

server.listen(port, () => {
    console.log(`Server running at ${port}`);
});
