const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const SerialPort = require("serialport");
const Delimiter = require("@serialport/parser-delimiter");

const port = process.env.npm_config_port || 3000;

//CODIGOS DE MENSAJES
const nextTurn = "NT";
const bingoSomeone = "G";
const numberBingo = "N";

//PUERTO COM SELECCIONADO
let comElegido = null;

//server 1
if (port == 8000) {
    comElegido = new SerialPort("COM2", {
        baudRate: 9600,
    });
}

//serve 2
if (port == 9000) {
    comElegido = new SerialPort("COM3", {
        baudRate: 9600,
    });
}

io.on("connection", (socket) => {
    console.log("A user connected");

    comElegido.on("data", function (data) {
        data = data.toString();
        console.log(data);

        //BLOQUE DE COMPORTAMIENTO EN MI TURNO
        if (data == nextTurn) {
            //mi turno = sacar numero
            //console.warn("--ES MI TURNO");
            io.emit("youTurn");
        } else if (data.includes(numberBingo) && waitingState) {
            waitingState = false;
            //PASAMOS TURNO
            comElegido.write(nextTurn);
        } else if (data == bingoSomeone && waitingState) {
            waitingState = false;

            /* BLOQUE DE COMPORTAMIENTO DURANTE OTRO TURNO*/
        } else if (data.includes(numberBingo)) {
            numCarton = data.substr(1, 2);
            io.emit("numNew", numCarton);
        } else if (data == bingoSomeone) {
            //Gano alguien
            io.emit("bingoEnd", numCarton);
            comElegido.write(bingoSomeone);
        }
    });

    //SACAMOS NUMERO
    socket.on("emit_num", (data) => {
        dataToSend = `${numberBingo}${data}`;
        waitingState = true;
        comElegido.write(dataToSend);
    });

    //BINGO PROPIOOO
    socket.on("emit_bingo", () => {
        waitingState = true;
        comElegido.write(bingoSomeone);
    });

    //TURNO LISTO
    socket.on("emit_nt", () => {
        comElegido.write(nextTurn);
    });
});

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.send("Hello World!");
});

server.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
