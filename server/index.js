const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const SerialPort = require("serialport");
const Delimiter = require("@serialport/parser-delimiter");

//const port = process.env.npm_config_port || 3000;
let port = null;
const n_equip = process.env.npm_config_equipo || 1;

//CODIGOS DE MENSAJES
const nextTurn = "NT";
const bingoSomeone = "G";
const numberBingo = "N";

//PUERTO COM ESCRITURA SELECCIONADO
let comEscritura = null;
let comLectura = null;

let comElegido = null;

switch (Number(n_equip)) {
    case 1:
        port = 6000;
        comEscritura = new SerialPort("COM11", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM14", {
            baudRate: 9600,
        });
        break;

    case 2:
        port = 7000;
        comEscritura = new SerialPort("COM12", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM11", {
            baudRate: 9600,
        });
        break;

    case 3:
        port = 8000;
        comEscritura = new SerialPort("COM13", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM12", {
            baudRate: 9600,
        });
        break;

    case 4:
        port = 9000;
        comEscritura = new SerialPort("COM14", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM13", {
            baudRate: 9600,
        });
        break;

    default:
        break;
}

console.log("PC: ", n_equip, "Puerto: ", port);

io.on("connection", (socket) => {
    console.log("A user connected");

    comLectura.on("data", function (data) {
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
            comEscritura.write(nextTurn);
        } else if (data == bingoSomeone && waitingState) {
            waitingState = false;

            /* BLOQUE DE COMPORTAMIENTO DURANTE OTRO TURNO*/
        } else if (data.includes(numberBingo)) {
            numCarton = data.substr(1, 2);
            io.emit("numNew", numCarton);
        } else if (data == bingoSomeone) {
            //Gano alguien
            io.emit("bingoEnd", numCarton);
            comEscritura.write(bingoSomeone);
        }
    });

    //SACAMOS NUMERO
    socket.on("emit_num", (data) => {
        dataToSend = `${numberBingo}${data}`;
        waitingState = true;
        comEscritura.write(dataToSend);
    });

    //BINGO PROPIOOO
    socket.on("emit_bingo", () => {
        waitingState = true;
        comEscritura.write(bingoSomeone);
    });

    //TURNO LISTO
    socket.on("emit_nt", () => {
        comEscritura.write(nextTurn);
    });
});

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.send("Hello World!");
});

server.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
