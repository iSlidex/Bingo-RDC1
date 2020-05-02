const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);
const SerialPort = require("serialport");

SerialPort.list().then(
    (ports) => ports.forEach(console.log),
    (err) => console.error(err)
);

const port = 3000;

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.send("Hello World!");
});

io.on("connection", (socket) => {
    console.log("A user connected");
    io.emit("success");

    socket.on("emit_nombre", (data) => {
        console.log("Nombre set ", data);
        socket.emit("success");
    });

    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
});

/*
app.listen(app, function () {
    console.log("App listening on port 3000!");
});*/

server.listen(port, () => {
    console.log("App listening on port 3000!");
});
