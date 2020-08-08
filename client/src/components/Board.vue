<template>
    <div>
        <v-content>
            <div>
                <v-container class="fill-height" fluid>
                    <v-row align="center" justify="center">
                        <v-col
                            cols="12"
                            sm="8"
                            md="4"
                            v-for="carton in parseInt(player.settings.cards)"
                            :key="carton.id"
                        >
                            <v-card class="elevation-12">
                                <v-toolbar color="primary" dark flat>
                                    <v-toolbar-title>Das Bingo {{ carton }}</v-toolbar-title>
                                    <v-spacer />
                                    <p v-show="isMyTurn">Mi turno</p>
                                </v-toolbar>
                                <v-container>
                                    <v-card-text>
                                        <v-simple-table>
                                            <template v-slot:default>
                                                <thead>
                                                    <tr>
                                                        <th class="header">B</th>
                                                        <th class="header">I</th>
                                                        <th class="header">N</th>
                                                        <th class="header">G</th>
                                                        <th class="header">O</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-for="item in 5" :key="item.id">
                                                        <td
                                                            style="background-color:white"
                                                            :id="'B' + carton + item"
                                                            @click="markSquare('B' + carton + item)"
                                                        >
                                                            {{ card[carton - 1].B[item - 1] }}
                                                        </td>
                                                        <td
                                                            style="background-color:white"
                                                            :id="'I' + carton + item"
                                                            @click="markSquare('I' + carton + item)"
                                                        >
                                                            {{ card[carton - 1].I[item - 1] }}
                                                        </td>
                                                        <td
                                                            style="background-color:white"
                                                            :id="'N' + carton + item"
                                                            @click="markSquare('N' + carton + item)"
                                                        >
                                                            {{ card[carton - 1].N[item - 1] }}
                                                        </td>
                                                        <td
                                                            style="background-color:white"
                                                            :id="'G' + carton + item"
                                                            @click="markSquare('G' + carton + item)"
                                                        >
                                                            {{ card[carton - 1].G[item - 1] }}
                                                        </td>
                                                        <td
                                                            style="background-color:white"
                                                            :id="'O' + carton + item"
                                                            @click="markSquare('O' + carton + item)"
                                                        >
                                                            {{ card[carton - 1].O[item - 1] }}
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </template>
                                        </v-simple-table>
                                        <v-form v-on:submit.prevent="enviar"></v-form>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer />
                                        <v-btn
                                            @click="generateAnotherCard(carton - 1)"
                                            color="primary"
                                            :disabled="resetDisabled[carton - 1]"
                                            >Reset</v-btn
                                        >
                                        <v-btn @click="checks(carton - 1)" color="primary"
                                            >BINGO!</v-btn
                                        >
                                    </v-card-actions>
                                </v-container>
                            </v-card>
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col class="d-flex">
                            <v-btn
                                @click="sacarNum()"
                                class="mx-auto"
                                color="primary"
                                v-show="isMyTurn"
                                >SACAR NÚMERO</v-btn
                            >
                        </v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="3">Ultimo Numero: {{ currentCall }}</v-col>
                    </v-row>
                    <v-row>
                        <v-col cols="8">
                            Numeros sacados [ {{ calledNumbers.length }} ]:
                            <span v-for="num in calledNumbersLetters" :key="num.id">
                                {{ num }}
                                <span
                                    v-if="
                                        calledNumbersLetters.length > 1 &&
                                            calledNumbersLetters.findIndex(
                                                (element) => element == num
                                            ) +
                                                1 !=
                                                calledNumbersLetters.length
                                    "
                                    >-</span
                                >
                            </span>
                            <div>
                                <span></span>
                            </div>
                        </v-col>
                    </v-row>
                </v-container>
            </div>
        </v-content>
    </div>
</template>

<script>
export default {
    props: ["player"],
    components: {},
    data() {
        return {
            card: {
                0: {
                    B: { 0: "1", 1: "2", 2: "3", 3: "4", 4: "5" },
                    I: { 0: "6", 1: "7", 2: "8", 3: "9", 4: "10" },
                    N: { 0: "11", 1: "12", 2: "LIBRE", 3: "14", 4: "15" },
                    G: { 0: "16", 1: "17", 2: "18", 3: "19", 4: "20" },
                    O: { 0: "21", 1: "22", 2: "23", 3: "24", 4: "25" },
                },
                1: {
                    B: { 0: "1", 1: "2", 2: "333", 3: "4", 4: "5" },
                    I: { 0: "6", 1: "7", 2: "888", 3: "9", 4: "10" },
                    N: { 0: "11", 1: "12", 2: "LIBRE", 3: "14", 4: "15" },
                    G: { 0: "16", 1: "17", 2: "18", 3: "19", 4: "20" },
                    O: { 0: "21", 1: "22", 2: "23", 3: "24", 4: "25" },
                },
            },
            resetDisabled: {
                0: false,
                1: false,
            },
            currentCall: "",
            win: false,
            boleta: [25],
            isMyTurn: false,
        };
    },
    computed: {
        usedNumbers: function() {
            return new Array(76);
        },
        usedNumbers1: function() {
            return new Array(76);
        },
        calledNumbers: function() {
            return new Array();
        },
        calledNumbersLetters: function() {
            return new Array();
        },
        goal: function() {
            return "line";
        },
    },
    watch: {
        //ACA EMITIR LO QUE SEA POR NODE :V
        win: function() {
            if (this.win) {
                console.log("ganaste bb");
            }
        },
    },
    sockets: {
        youTurn() {
            //turno de sacar numero
            console.warn("EVENT youTurn");
            //1-AQUI HAY QUE LLAMAR A SACAR NUMERO
            this.isMyTurn = true;
        },
        numNew(num) {
            //NUMERO RECIBIDO
            console.warn("NUMERO RECIBIDO", num);

            //1-Actualizar tablero
            //2-Comprobar bingo propio
            this.callNumber(num);

            //3-Llamar enviarNumero(num) para reenviar a pc de a lado
            this.$socket.client.emit("emit_num", num, this.win);
        },
        bingoEnd() {
            //Recibes si Gano alguien
            //Mostrar mensaje - FIN
            console.warn("EVENT bingoEnd Gano alguien");
        },
    },
    methods: {
        enviarNumero(num, flagBingoPropio = false) {
            console.warn("ENVIANDO NUMERO");
            this.isMyTurn = false;
            this.$socket.client.emit("emit_num", num, flagBingoPropio);
        },
        sacarNum() {
            this.callNumber();

            //2- Transmitirlo con enviarNumero()
            console.warn("Num a enviar", this.currentCall);
            this.enviarNumero(this.currentCall, this.win);
        },
        enviar() {
            this.$emit("updateName", this.nombre);
        },
        async sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        generateNewCard(carton) {
            // set all elements in usedNumbers array as false
            this.resetUsedNumbers(carton);
            // loops 24 times because there are 24 squares (not including free square)
            for (var i = 0; i < 25; i++) {
                if (i == 12)
                    // skip free square
                    continue;
                // generates a number for each square
                this.generateSquare(i, carton);
            }
        },

        generateSquare(squareNum, carton) {
            // generates random number for each square (depends on column)
            var newNumber = (squareNum % 5) * 15 + this.generateNewNum();
            // loop makes sure there are no duplicates
            if (carton == 0) {
                while (this.usedNumbers[newNumber] == true) {
                    newNumber = (squareNum % 5) * 15 + this.generateNewNum();
                }
                this.usedNumbers[newNumber] = true;
            } else {
                while (this.usedNumbers1[newNumber] == true) {
                    newNumber = (squareNum % 5) * 15 + this.generateNewNum();
                }
                this.usedNumbers1[newNumber] = true;
            }
            // sets the used number in the array as true so no duplicates

            // sets the current square to the new number
            switch (squareNum % 5) {
                case 0:
                    {
                        this.card[carton].B[~~(squareNum / 5)] = newNumber;
                    }
                    break;
                case 1:
                    {
                        this.card[carton].I[~~(squareNum / 5)] = newNumber;
                    }
                    break;
                case 2:
                    {
                        this.card[carton].N[~~(squareNum / 5)] = newNumber;
                    }
                    break;
                case 3:
                    {
                        this.card[carton].G[~~(squareNum / 5)] = newNumber;
                    }
                    break;
                case 4:
                    {
                        this.card[carton].O[~~(squareNum / 5)] = newNumber;
                    }
                    break;
                default:
                    "";
            }
        },
        colorSquare(squareNum, carton) {
            let card = carton - 1;
            if (squareNum >= 1 && squareNum <= 15) {
                for (var k = 0; k < 5; k++) {
                    if (this.card[card].B[k] == squareNum) {
                        let searchStr1 = "B" + carton + (k + 1);
                        let currentSquare = document.getElementById(searchStr1);
                        currentSquare.style.color = "dimgray";
                        currentSquare.style.backgroundColor = "#99d8ea";
                        break;
                    }
                }
            } else if (squareNum >= 16 && squareNum <= 30) {
                for (var l = 0; l < 5; l++) {
                    if (this.card[card].I[l] == squareNum) {
                        let searchStr1 = "I" + carton + (l + 1);
                        let currentSquare = document.getElementById(searchStr1);
                        currentSquare.style.color = "dimgray";
                        currentSquare.style.backgroundColor = "#99d8ea";
                        break;
                    }
                }
            } else if (squareNum >= 31 && squareNum <= 45) {
                for (var n = 0; n < 5; n++) {
                    if (this.card[card].N[n] == squareNum) {
                        let searchStr1 = "N" + carton + (n + 1);
                        let currentSquare = document.getElementById(searchStr1);
                        currentSquare.style.color = "dimgray";
                        currentSquare.style.backgroundColor = "#99d8ea";
                        break;
                    }
                }
            } else if (squareNum >= 46 && squareNum <= 60) {
                for (var g = 0; g < 5; g++) {
                    if (this.card[card].G[g] == squareNum) {
                        let searchStr1 = "G" + carton + (g + 1);
                        let currentSquare = document.getElementById(searchStr1);
                        currentSquare.style.color = "dimgray";
                        currentSquare.style.backgroundColor = "#99d8ea";
                        break;
                    }
                }
            } else {
                for (var o = 0; o < 5; o++) {
                    if (this.card[card].O[o] == squareNum) {
                        let searchStr1 = "O" + carton + (o + 1);
                        let currentSquare = document.getElementById(searchStr1);
                        currentSquare.style.color = "dimgray";
                        currentSquare.style.backgroundColor = "#99d8ea";
                        break;
                    }
                }
            }
        },

        checks(carton) {
            if (this.player.settings.mode == "linea") {
                if (
                    this.checkB(carton) ||
                    this.checkI(carton) ||
                    this.checkN(carton) ||
                    this.checkG(carton) ||
                    this.checkO(carton) ||
                    this.checkDP(carton) ||
                    this.checkDS(carton) ||
                    this.checkLine(carton, 0) ||
                    this.checkLine(carton, 1) ||
                    this.checkLine(carton, 2) ||
                    this.checkLine(carton, 3) ||
                    this.checkLine(carton, 4)
                ) {
                    this.win = true;
                }
            }
            if (this.player.settings.mode == "completo") {
                if (
                    this.checkB(carton) &&
                    this.checkI(carton) &&
                    this.checkN(carton) &&
                    this.checkG(carton) &&
                    this.checkO(carton)
                ) {
                    this.win = true;
                }
            }
        },
        checkLine(carton, line) {
            if (line == 2) {
                return (
                    this.calledNumbers.includes(this.card[carton].B[line]) &&
                    this.calledNumbers.includes(this.card[carton].I[line]) &&
                    this.calledNumbers.includes(this.card[carton].G[line]) &&
                    this.calledNumbers.includes(this.card[carton].O[line])
                );
            } else
                return (
                    this.calledNumbers.includes(this.card[carton].B[line]) &&
                    this.calledNumbers.includes(this.card[carton].I[line]) &&
                    this.calledNumbers.includes(this.card[carton].N[line]) &&
                    this.calledNumbers.includes(this.card[carton].G[line]) &&
                    this.calledNumbers.includes(this.card[carton].O[line])
                );
        },
        checkDP(carton) {
            return (
                this.calledNumbers.includes(this.card[carton].B[0]) &&
                this.calledNumbers.includes(this.card[carton].I[1]) &&
                this.calledNumbers.includes(this.card[carton].G[3]) &&
                this.calledNumbers.includes(this.card[carton].O[4])
            );
        },
        checkDS(carton) {
            return (
                this.calledNumbers.includes(this.card[carton].O[0]) &&
                this.calledNumbers.includes(this.card[carton].G[1]) &&
                this.calledNumbers.includes(this.card[carton].I[3]) &&
                this.calledNumbers.includes(this.card[carton].B[4])
            );
        },
        checkB(carton) {
            return (
                this.calledNumbers.includes(this.card[carton].B[0]) &&
                this.calledNumbers.includes(this.card[carton].B[1]) &&
                this.calledNumbers.includes(this.card[carton].B[2]) &&
                this.calledNumbers.includes(this.card[carton].B[3]) &&
                this.calledNumbers.includes(this.card[carton].B[4])
            );
        },
        checkI(carton) {
            return (
                this.calledNumbers.includes(this.card[carton].I[0]) &&
                this.calledNumbers.includes(this.card[carton].I[1]) &&
                this.calledNumbers.includes(this.card[carton].I[2]) &&
                this.calledNumbers.includes(this.card[carton].I[3]) &&
                this.calledNumbers.includes(this.card[carton].I[4])
            );
        },
        checkN(carton) {
            return (
                this.calledNumbers.includes(this.card[carton].B[0]) &&
                this.calledNumbers.includes(this.card[carton].B[1]) &&
                this.calledNumbers.includes(this.card[carton].B[3]) &&
                this.calledNumbers.includes(this.card[carton].B[4])
            );
        },
        checkG(carton) {
            return (
                this.calledNumbers.includes(this.card[carton].G[0]) &&
                this.calledNumbers.includes(this.card[carton].G[1]) &&
                this.calledNumbers.includes(this.card[carton].G[2]) &&
                this.calledNumbers.includes(this.card[carton].G[3]) &&
                this.calledNumbers.includes(this.card[carton].G[4])
            );
        },
        checkO(carton) {
            return (
                this.calledNumbers.includes(this.card[carton].O[0]) &&
                this.calledNumbers.includes(this.card[carton].O[1]) &&
                this.calledNumbers.includes(this.card[carton].O[2]) &&
                this.calledNumbers.includes(this.card[carton].O[3]) &&
                this.calledNumbers.includes(this.card[carton].O[4])
            );
        },
        unColorSquare(carton) {
            let searchStr0 = "";
            let searchStr1 = "";
            let searchStr2 = "";
            let searchStr3 = "";
            let searchStr4 = "";
            let currentSquare0;
            let currentSquare1;
            let currentSquare2;
            let currentSquare3;
            let currentSquare4;
            let card = carton + 1;
            for (var k = 0; k < 5; k++) {
                searchStr0 = "B" + card + "" + (k + 1);
                currentSquare0 = document.getElementById(searchStr0);
                searchStr1 = "I" + card + "" + (k + 1);
                currentSquare1 = document.getElementById(searchStr1);
                searchStr2 = "N" + card + "" + (k + 1);
                currentSquare2 = document.getElementById(searchStr2);
                searchStr3 = "G" + card + "" + (k + 1);
                currentSquare3 = document.getElementById(searchStr3);
                searchStr4 = "O" + card + "" + (k + 1);
                currentSquare4 = document.getElementById(searchStr4);
                currentSquare0.style.color = "black";
                currentSquare0.style.backgroundColor = "#ffffff";
                currentSquare1.style.color = "black";
                currentSquare1.style.backgroundColor = "#ffffff";
                currentSquare2.style.color = "black";
                currentSquare2.style.backgroundColor = "#ffffff";
                currentSquare3.style.color = "black";
                currentSquare3.style.backgroundColor = "#ffffff";
                currentSquare4.style.color = "black";
                currentSquare4.style.backgroundColor = "#ffffff";
            }
        },

        generateNewNum() {
            // generates a random numbers between 1 and 15
            return Math.floor(Math.random() * 15 + 1); //15
        },

        resetUsedNumbers(carton) {
            // sets all elements of the usedNumbers array to false (resets the array)
            if (carton == 0)
                for (var i = 0; i < this.usedNumbers.length; i++) {
                    this.usedNumbers[i] = false;
                }
            else
                for (var j = 0; j < this.usedNumbers.length; j++) {
                    this.usedNumbers1[j] = false;
                }
        },

        // when clicked, generates a new random card
        async generateAnotherCard(carton) {
            this.resetDisabled[carton] = true;
            this.resetUsedNumbers(carton);
            this.generateNewCard(carton);
            this.unColorSquare(carton);
            this.resetDisabled[carton] = false;
        },

        // resets all squares except FREE to white
        resetSquareColours() {
            for (var i = 0; i < 25; i++) {
                if (i == 12) continue;
                var currentSquare = document.getElementById("sq" + i);
                currentSquare.style.backgroundColor = "#ffffff";
            }
            return;
        },

        markSquare(square) {
            var currentSquare = document.getElementById(square);
            if (currentSquare.style.backgroundColor == "lightblue")
                currentSquare.style.backgroundColor = "#ffffff";
            else currentSquare.style.backgroundColor = "lightblue";
            return;
        },

        callNumber(gen_num = null) {
            var rand;
            if (gen_num) {
                //Extraemos el numero del string Ej: "O75" => 75
                rand = Number(gen_num.substring(1));
                console.log("Uso numero", rand);
            } else {
                console.log("Saco numero");
                rand = Math.floor(Math.random() * 75) + 1; // random number between 1 and 75
            }
            // if the number is in the array (already been called)
            if (this.calledNumbers.includes(rand)) this.callNumber();
            else {
                this.calledNumbers.push(rand);
                if (rand >= 1 && rand <= 15) {
                    this.currentCall = "B" + rand;
                    this.calledNumbersLetters.push(this.currentCall);
                } else if (rand >= 16 && rand <= 30) {
                    this.currentCall = "I" + rand;
                    this.calledNumbersLetters.push(this.currentCall);
                } else if (rand >= 31 && rand <= 45) {
                    this.currentCall = "N" + rand;
                    this.calledNumbersLetters.push(this.currentCall);
                } else if (rand >= 46 && rand <= 60) {
                    this.currentCall = "G" + rand;
                    this.calledNumbersLetters.push(this.currentCall);
                } else {
                    this.currentCall = "O" + rand;
                    this.calledNumbersLetters.push(this.currentCall);
                }
                for (var i = 1; i <= this.player.settings.cards; i++) {
                    this.colorSquare(rand, i);
                    this.checks(i - 1);
                }
            }
        },
    },
    created() {
        for (var k = 0; k < parseInt(this.player.settings.cards); k++) this.generateNewCard(k);
    },
};
</script>
<style scoped>
th,
td {
    border: 2.5px solid black;
    text-align: center;
}

.square {
    font-size: 20px;
    background-color: #ffffff;
    width: 100%;
    padding: 20px;
    border: none;
}

#bingo-card {
    margin: 0 auto;
    text-align: center;
    width: 2em;
    height: 2em;
    border-collapse: collapse;
    background: #d3d3d3;
}

.header {
    background: rgb(25, 118, 210);
    font-size: 20px;
    color: #fff !important;
}

#sq12 {
    background: lightblue;
}

#goals,
#actions {
    color: #ffffff;
    text-align: center;
}

.button {
    background-color: #ffffff;
    border: 2px solid grey;
    color: #000000;
    padding: 8px 15px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 13px;
    margin: 2px 2px;
    margin-top: -10px;
    transition-duration: 0.4s;
    cursor: pointer;
    width: 100px;
}

.button:hover {
    background-color: #4286f4;
    color: #ffffff;
}

.square {
    cursor: pointer;
}

button:focus {
    outline: 0;
}
</style>
