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
const NEXT_TURN = "NT";
const BINGO_SOMEONE = "G";
const NUMBER_BINGO = "N";
const BEGIN_GAME = "BG";
const modoLineal = "Lineal";
const modoCompleto = "Completo";

//ESTADOS
let waitingState = false;
let playingState = false;
let mineTurnState = false;

let numPlayer = 1;

//PUERTO COM ESCRITURA SELECCIONADO
let comEscritura = null;
let comLectura = null;

//let comElegido = null;

switch (Number(n_equip)) {
    case 1:
        port = 6000;
        comEscritura = new SerialPort("COM11", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM18", {
            baudRate: 9600,
        });
        break;

    case 2:
        port = 7000;
        comEscritura = new SerialPort("COM13", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM12", {
            baudRate: 9600,
        });
        break;

    case 3:
        port = 8000;
        comEscritura = new SerialPort("COM15", {
            baudRate: 9600,
        });
        comLectura = new SerialPort("COM14", {
            baudRate: 9600,
        });
        break;

    case 4:
        port = 9000;
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

    comLectura.on("data", function (data) {
        data = data.toString();
        console.log(data);

        let { modo, flag, num } = data;

        //Si estamos con juego configurado
        if (playingState) {
            //BLOQUE DE COMPORTAMIENTO EN MI TURNO
            if (modo == NEXT_TURN) {
                //mi turno = sacar numero
                mineTurnState = true;
                //console.warn("--ES MI TURNO");
                io.emit("youTurn");
            } else if (modo === NUMBER_BINGO && waitingState) {
                //Hay bingo?
                if (flag) {
                    //waitingState = true; ya ta' true ;)
                    //Esperar y transmitir bingo
                    comEscritura.write(enviar()); //REVISAR QUE SE ENVIA en enviar();
                } else {
                    //No hay => PASAMOS TURNO
                    waitingState = false;
                    mineTurnState = false;
                    comEscritura.write(enviar(NEXT_TURN)); //REVISAR QUE SE ENVIA en enviar();
                }
            } else if (modo === BINGO_SOMEONE && waitingState) {
                //Alguien ganó => fin
                waitingState = false;

                /* BLOQUE DE COMPORTAMIENTO DURANTE OTRO TURNO*/
            } else if (data.includes(NUMBER_BINGO)) {
                //Recibimos numero
                //numCarton = data.substr(1, 2);
                io.emit("numNew", num);
            } else if (modo === BINGO_SOMEONE) {
                //Gano alguien
                io.emit("bingoEnd", num);
                comEscritura.write(BINGO_SOMEONE); //REVISAR que se manda (pasar al siguiente)
            }
        } else if (waitingState && !playingState) {
            //Finalizar espera => Sacar Numero
            waitingState = false;
            io.emit("youTurn");
        } else {
            //Sin juego configurado
            // data: {numero: 1, flag: 'Lineal'}
            numPlayer = data.numero++;

            //Emitir a Vue Modo de juego
            io.emit("confModo", data.flag);

            //Cambio estado
            playingState = true;
        }
    });

    //YO INICIO PARTIDA / CONFIGURO
    socket.on("emit_iniciar", (data) => {
        //TO-DO VER QUE ME MANDAN

        //Completo = 1
        comEscritura.write(enviar(BEGIN_GAME, numPlayer, data === modoCompleto));
        waitingState = true;
    });

    //SACAMOS NUMERO
    socket.on("emit_num", (num, flagBP) => {
        //dataToSend = `${NUMBER_BINGO}${data}`;
        //comEscritura.write(dataToSend);

        //Enviamos numero con flag de bingo propio
        comEscritura.write(enviar(num, flagBP)); //Letra y Num y si con eso canta bingo

        //Activo espera si es mi turno
        if (mineTurnState) {
            waitingState = true;
        }
    });

    //BINGO PROPIOOO
    /*socket.on("emit_bingo", () => {
        waitingState = true;
        comEscritura.write(enviar(BINGO_SOMEONE));
    });*/

    //TURNO LISTO
    /* socket.on("emit_nt", () => {
        mineTurnState = false;
        comEscritura.write(enviar(NEXT_TURN));
    });*/

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

        if (flag) payload | 16;
        // X OR 1 (bit 4) es 1
        else payload & (255 - 16); // X AND 0 (bit 4) es 0

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
        else if (modo === iniciarPartida) payload |= 5 << 5; //Escribe 101

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
            payload = _escribirFlag(flag); //Indica si canta bingo
        } else if (modo === BEGIN_GAME) {
            payload = _escribirFlag(flag); //Se indica si es lineal o completo
            payload = _escribirModo(BEGIN_GAME); //Se indica que se inicia el juego
            payload |= numero % 4; //Se indica el numero de jugador
        } else if (modo === BINGO_SOMEONE) {
            payload = _escribirModo(BINGO_SOMEONE);
        } else if (modo === NEXT_TURN) {
            payload = _escribirModo(NEXT_TURN);
        }

        return _crearMensaje(payload);
    };
});

app.use(express.static("public"));

app.get("/", function (req, res) {
    res.send("Hello World!");
});

server.listen(port, () => {
    console.log(`App listening on port ${port}!`);
});
