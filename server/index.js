const express = require("express");
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

const SerialPort = require("serialport");
const Delimiter = require("@serialport/parser-delimiter");

//const port = process.env.npm_config_port || 3000;
let port = 8085;
const n_equip = process.env.npm_config_equipo || 1;

//CODIGOS DE MENSAJES
const NEXT_TURN = "NT";
const BINGO_SOMEONE = "G";
const NUMBER_BINGO = "N";
const BEGIN_GAME = "BG";
const modoLineal = "lineal";
const modoCompleto = "completo";

//ESTADOS
let waitingState = false;
let playingState = false;
let myTurnState = false;

let numPlayer = 1;

//PUERTO COM ESCRITURA SELECCIONADO
let comEscritura = null;
let comLectura = null;

//let comElegido = null;

switch (Number(n_equip)) {
    case 1:
        port = 8085;
        comEscritura = new SerialPort("COM11", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM18", {
            baudRate: 9600,
        });
        break;

    case 2:
        port = 8086;
        comEscritura = new SerialPort("COM13", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM12", {
            baudRate: 9600,
        });
        break;

    case 3:
        port = 8087;
        comEscritura = new SerialPort("COM15", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM14", {
            baudRate: 9600,
        });
        break;

    case 4:
        port = 8088;
        comEscritura = new SerialPort("COM17", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM16", {
            baudRate: 9600,
        });
        break;

    default:
        break;
}

console.log("PC: ", n_equip, "Puerto: ", port);

io.on("connection", (socket) => {
    console.log("A user connected");
    //io.emit("youTurn");

    comLectura.on("data", function (data) {
        //console.log("DATA: ", data, data.toString());

        let { modo, flag, num } = leer(data);

        //Si estamos con juego configurado
        if (playingState) {
            //BLOQUE DE COMPORTAMIENTO EN MI TURNO
            if (modo == NEXT_TURN) {
                //mi turno = sacar numero
                myTurnState = true;
                console.warn("IN - ES MI TURNO");
                io.emit("youTurn");
            } else if (modo === NUMBER_BINGO && waitingState) {
                //Hay bingo?
                if (flag) {
                    //waitingState = true; ya ta' true ;)
                    //Esperar y transmitir bingo
                    console.log("IN - (VUELTA DE NUM) NextT con bingo");
                    console.log("OUT - BINGO_SOMEONE");
                    comEscritura.write(enviar(BINGO_SOMEONE));
                } else {
                    //No hay => PASAMOS TURNO
                    waitingState = false;
                    myTurnState = false;

                    console.log("IN - (VUELTA DE NUM) NextT");
                    console.log("OUT - NEXT_TURN");
                    comEscritura.write(enviar(NEXT_TURN));
                }
            } else if (modo === BINGO_SOMEONE && waitingState) {
                //Alguien ganó => fin
                console.log("IN - Alguien ganó (VUELTA)");
                //Se acabo
                waitingState = false;
                playingState = false;
                myTurnState = false;
                io.emit("bingoEnd");

                /* BLOQUE DE COMPORTAMIENTO DURANTE OTRO TURNO*/
            } else if (modo === NUMBER_BINGO) {
                //Recibimos numero
                console.log("IN - Recibimos numero", num);
                io.emit("numNew", num, flag);
            } else if (modo === BINGO_SOMEONE) {
                //Gano alguien
                console.log("IN - Gano alguien");
                io.emit("bingoEnd");

                //Se acabo
                waitingState = false;
                playingState = false;
                myTurnState = false;

                comEscritura.write(enviar(BINGO_SOMEONE)); //(pasar al siguiente)
            }
        } else if (waitingState && !playingState) {
            //Finalizar espera => Sacar Numero
            waitingState = false;
            //Cambio estado
            playingState = true;
            console.log("IN - youTurn 1ero");
            io.emit("youTurn");
        } else {
            //Sin juego configurado
            // data: {num: 'N33', flag: 'Lineal'}
            //CAMBIAR DATA
            console.log("IN - Juego configurado", modo, flag, num);
            numPlayer = num++;

            //Emitir a Vue Modo de juego
            io.emit("confModo", flag ? modoCompleto : modoLineal);

            //Cambio estado
            playingState = true;

            console.log("OUT - BEGIN_GAME");
            comEscritura.write(enviar(BEGIN_GAME, numPlayer, flag === modoCompleto));
        }
    });

    //YO INICIO PARTIDA / CONFIGURO
    socket.on("emit_iniciar", (data) => {
        let a_enviar = enviar(BEGIN_GAME, numPlayer, data === modoCompleto);
        console.log("OUT - emit_iniciar", data, numPlayer, a_enviar);
        //TO-DO VER QUE ME MANDAN

        //Completo = 1
        waitingState = true;
        myTurnState = true;
        comEscritura.write(a_enviar);
    });

    //SACAMOS NUMERO
    socket.on("emit_num", (num, flagBP) => {
        let a_enviar = enviar(NUMBER_BINGO, num, flagBP);
        console.log("OUT - emit_num", num, flagBP, a_enviar);

        //Activo espera si es mi turno
        if (myTurnState) {
            console.log("Estamos en turno", myTurnState);
            waitingState = true;
        }

        //Enviamos numero con flag de bingo propio
        comEscritura.write(a_enviar); //Letra y Num y si con eso canta bingo
    });

    /*
    ESTRUCTURA PROTOCOLO 1 BYTE LLLFNNNN
    * LLL representa una letra o indica la configuracion inicial, el siguiente turno, o si hubo ganador
    * F es un flag para cantar bingo al recibir/sacar una bola y transmitirlo o decir LINEAL O COMPLETO
    * NNNN es el numero del carton o jugador en la configuracion inicial
    */

    //MASCARAS PROTOCOLOS
    const MASCARA_NUM = 15;
    const MASCARA_FLAG = 16;

    //FUNCIONES PROTOCOLO DECODIFICADO
    /**
     * Permite obtener el numero de jugador o de una letra
     *
     * @param {Number} payload Byte de payload recibido en la trama
     * @returns {Number} numero entre el 0 y 15
     */
    const _obtenerNumero = (payload) => payload & MASCARA_NUM;

    /**
     *
     * Indica el valor del bit 5 para obtener el modo
     *
     * 1.En el inicio se coloca 0 para Linea y 1 para Completo
     * 2.En el pase de mensajes indica si hubo un ganador en la transimision de la bola
     *
     * @param {Number} payload
     * @returns {Boolean}
     *
     */
    const _obtenerFlag = (payload) => payload & MASCARA_FLAG;

    /**
     * Permite obtener el modo o letra del mensaje
     *
     * @param {Number} payload
     * @returns {Number}
     * 0 es B
     * 1 es I
     * 2 es N
     * 3 es G
     * 4 es O
     * 5 es BEGIN_GAME
     * 6 es NEXT_TURN
     * 7 es BINGO_SOMEONE
     */
    const _obtenerModo = (payload) => payload >> 5;

    /**
     * Obtiene el valor ingresado en el mensaje
     * @param {Buffer} data
     */
    const _obtenerPayload = (data) => {
        if (data.length !== 6) return null;

        let i = 0;
        const inicio = "B1"
            .split("")
            .filter((letra) => letra.charCodeAt(0).toString(16) === data[i++]);

        let payload = data[i++];

        const fin = "O75"
            .split("")
            .filter((letra) => letra.charCodeAt(0).toString(16) === data[i++]);

        if (inicio.length === 0 && fin.length === 0) return payload;
        else return null;
    };

    //FUNCIONES PROTOCOLO CODIFICADO
    /**
     *
     * Metodo encargado de crear el Buffer
     * @param {Number} payload
     * @returns {Buffer}
     */
    const _crearMensaje = (payload) => {
        let mensaje = Buffer.alloc(6);
        //Se escribe la cabeza
        mensaje.write("B1", 0, "utf-8");

        //se escribe el mensaje
        mensaje[2] = payload;

        //Se escribe el fin
        mensaje.write("O75", 3, "utf-8");

        return mensaje;
    };

    /**
     *
     * Permite realizar la conversion al protocolo dado un String
     * para un mensaje sin numero
     *  Ej: "N37" // 0x67
     * @param {String} letraNumero "N37"
     * @param {Number} payload 0x00
     *
     * @returns {Number} 01100111 || 0x67
     */
    const _escribirLetraYNumero = (letraNumero, payload) => {
        if (payload === undefined) payload = 0;
        //obtengo la letra
        let letra = letraNumero[0];
        let numero = letraNumero.substr(1);

        let conversion = 0;
        switch (letra) {
            case "O":
                conversion++;
            case "G":
                conversion++;
            case "N":
                conversion++;
            case "I":
                conversion++;
        }
        //Se escribe la letra
        payload = conversion << 5;
        //Se escribe el numero
        return (payload |= (numero % 16) + conversion);
    };

    /**
     * Permite escribir 1 o 0 en el bit de flag para cualquier mensaje
     * @param {Boolean} flag
     * @param {Number} payload
     */
    const _escribirFlag = (flag, payload) => {
        if (payload == undefined) payload = 0;

        if (flag) payload = payload | 16;
        // X OR 1 (bit 4) es 1
        else payload = payload & (255 - 16); // X AND 0 (bit 4) es 0

        return payload;
    };

    /**
     * Dado un modo se realiza su conversion para un mensaje sin modo
     * @param {*} modo
     * @param {*} payload
     */
    const _escribirModo = (modo, payload) => {
        if (payload === undefined) payload = 0;

        if (modo === NEXT_TURN) payload |= 6 << 5;
        //Escribe 110 en los primeros 3 bits mas significativos
        else if (modo === BINGO_SOMEONE) payload |= 7 << 5;
        //Escribe 111
        else if (modo === BEGIN_GAME) payload |= 5 << 5; //Escribe 101

        return payload;
    };

    //FUNCIONES PROTOCOLO GENERAL
    /**
     * @param {String} modo //BEGIN_GAME, NUMBER_BINGO
     * @param {String} numero
     * @param {Boolean} flag //BINGO_SOMEONE (NEXT_TURN), (Lineal (0), Completo(1)) si es BEGIN_GAME
     *
     */
    const enviar = (modo, numero, flag) => {
        let payload = 0; //MENSAJE VACIO
        //SI NO HAY MODO ENVIAR LETRA Y NUMERO
        if (modo === NUMBER_BINGO) {
            payload = _escribirLetraYNumero(numero); //Escribe la letra y numero
            payload = _escribirFlag(flag, payload); //Indica si canta bingo
        } else if (modo === BEGIN_GAME) {
            payload = _escribirFlag(flag); //Se indica si es lineal o completo
            payload = _escribirModo(BEGIN_GAME, payload); //Se indica que se inicia el juego
            payload |= numero % 4; //Se indica el numero de jugador
        } else if (modo === BINGO_SOMEONE) {
            payload = _escribirModo(BINGO_SOMEONE);
        } else if (modo === NEXT_TURN) {
            payload = _escribirModo(NEXT_TURN);
        }

        return _crearMensaje(payload);
    };

    /**
     * Obtener el modo, flag y num
     *
     * @param {Buffer} data
     * @returns {Object} {modo, flag, num}
     */
    const leer = (data) => {
        let payload = _obtenerPayload(data);

        if (!payload) return null;

        let res = { modo: 0, flag: 0, num: 0 };

        switch (_obtenerModo(payload)) {
            case 0:
                res.modo = NUMBER_BINGO;
                res.num = "B" + _obtenerNumero(payload);
                break;
            case 1:
                res.modo = NUMBER_BINGO;
                res.num = "I" + (_obtenerNumero(payload) + 15);
                break;
            case 2:
                res.modo = NUMBER_BINGO;
                res.num = "N" + (_obtenerNumero(payload) + 30);
                break;
            case 3:
                res.modo = NUMBER_BINGO;
                res.num = "G" + (_obtenerNumero(payload) + 45);
                break;
            case 4:
                res.modo = NUMBER_BINGO;
                res.num = "O" + (_obtenerNumero(payload) + 60);
                break;
            case 5:
                res.modo = BEGIN_GAME;
                res.num = _obtenerNumero(payload);
                break;
            case 6:
                res.modo = NEXT_TURN;
                break;
            case 7:
                res.modo = BINGO_SOMEONE;
                break;
        }

        res.flag = _obtenerFlag(payload);

        return res;
    };
});

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.send("Hello World!");
});

server.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
