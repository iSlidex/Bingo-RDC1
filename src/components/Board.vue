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
                    <v-form v-on:submit.prevent="enviar"> </v-form>
                  </v-card-text>
                  <v-card-actions>
                    <v-spacer />
                    <v-btn
                      @click="generateAnotherCard(carton - 1)"
                      color="primary"
                      :disabled="resetDisabled[carton - 1]"
                      >Reset</v-btn
                    >
                    <v-btn color="primary">Jugar</v-btn>
                  </v-card-actions>
                </v-container>
              </v-card>
            </v-col>
          </v-row>
          <v-row>
            <v-col>
              <v-btn @click="callNumber()" color="primary" block
                >SACAR NÚMERO</v-btn
              >
            </v-col>
          </v-row>
          <v-row>
            <v-col cols="3"> Ultimo Numero: {{ currentCall }} </v-col>
          </v-row>
          <v-row>
            <v-col cols="8">
              Numeros sacados[{{ calledNumbers.length }}]:
              <span v-for="num in calledNumbersLetters" :key="num.id"
                >{{ num }}
                <span
                  v-if="
                    calledNumbersLetters.length > 1 &&
                      calledNumbersLetters.findIndex(
                        element => element == num
                      ) +
                        1 !=
                        calledNumbersLetters.length
                  "
                >
                  -
                </span>
              </span>
              <div>
                <span> </span>
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
          O: { 0: "21", 1: "22", 2: "23", 3: "24", 4: "25" }
        },
        1: {
          B: { 0: "1", 1: "2", 2: "333", 3: "4", 4: "5" },
          I: { 0: "6", 1: "7", 2: "888", 3: "9", 4: "10" },
          N: { 0: "11", 1: "12", 2: "LIBRE", 3: "14", 4: "15" },
          G: { 0: "16", 1: "17", 2: "18", 3: "19", 4: "20" },
          O: { 0: "21", 1: "22", 2: "23", 3: "24", 4: "25" }
        }
      },
      resetDisabled: {
        0: false,
        1: false
      },
      currentCall: "",
      boleta: [25]
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
    }
  },
  methods: {
    enviar() {
      this.$emit("updateName", this.nombre);
    },
    async sleep(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
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
      console.log("squareNum " + squareNum);
      console.log("carton " + carton);
      for (var i = 0; i < carton; i++) {
        let card = carton - 1;
        console.log("squareNum " + squareNum);
        if (squareNum >= 1 && squareNum <= 15) {
          for (var k = 0; k < 5; k++) {
            console.log(this.card[card].B[k]);
            if (this.card[i].B[k] == squareNum) {
              let searchStr1 = "B" + (i + 1) + (k + 1);
              let currentSquare = document.getElementById(searchStr1);
              console.log(
                "CS : B " + searchStr1 + " call: " + "B" + (i + 1) + (k + 1)
              );
              currentSquare.style.color = "dimgray";
              currentSquare.style.backgroundColor = "#99d8ea";
              break;
            }
          }
        } else if (squareNum >= 16 && squareNum <= 30) {
          for (var l = 0; l < 5; l++) {
            console.log(this.card[card].I[l]);
            if (this.card[i].I[l] == squareNum) {
              let searchStr1 = "I" + (i + 1) + (l + 1);
              let currentSquare = document.getElementById(searchStr1);
              console.log(
                "CS : I " + searchStr1 + " call: " + "I" + (i + 1) + (l + 1)
              );
              currentSquare.style.color = "dimgray";
              currentSquare.style.backgroundColor = "#99d8ea";
              break;
            }
          }
        } else if (squareNum >= 31 && squareNum <= 45) {
          for (var n = 0; n < 5; n++) {
            console.log(this.card[card].N[n]);
            if (this.card[i].N[n] == squareNum) {
              let searchStr1 = "N" + (i + 1) + (n + 1);
              let currentSquare = document.getElementById(searchStr1);
              console.log(
                "CS : N " + searchStr1 + " call: " + "N" + (i + 1) + (n + 1)
              );
              currentSquare.style.color = "dimgray";
              currentSquare.style.backgroundColor = "#99d8ea";
              break;
            }
          }
        } else if (squareNum >= 46 && squareNum <= 60) {
          for (var g = 0; g < 5; g++) {
            console.log(this.card[card].G[g]);
            if (this.card[i].G[g] == squareNum) {
              let searchStr1 = "G" + (i + 1) + (g + 1);
              let currentSquare = document.getElementById(searchStr1);
              console.log(
                "CS : G " + searchStr1 + " call: " + "G" + (i + 1) + (g + 1)
              );
              currentSquare.style.color = "dimgray";
              currentSquare.style.backgroundColor = "#99d8ea";
              break;
            }
          }
        } else {
          for (var o = 0; o < 5; o++) {
            console.log(this.card[card].O[o]);
            if (this.card[i].O[o] == squareNum) {
              let searchStr1 = "O" + (i + 1) + (o + 1);
              let currentSquare = document.getElementById(searchStr1);
              console.log(
                "CS : O " + searchStr1 + " call: " + "O" + (i + 1) + (o + 1)
              );
              currentSquare.style.color = "dimgray";
              currentSquare.style.backgroundColor = "#99d8ea";
              break;
            }
          }
        }
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
      console.log("marcando click " + square);
      var currentSquare = document.getElementById(square);
      if (currentSquare.style.backgroundColor == "lightblue")
        currentSquare.style.backgroundColor = "#ffffff";
      else currentSquare.style.backgroundColor = "lightblue";
      return;
    },

    callNumber() {
      var rand = Math.floor(Math.random() * 75) + 1; // random number between 1 and 75
      // if the number is in the array (already been called)
      if (this.calledNumbers.includes(rand)) this.callNumber();
      else {
        this.calledNumbers.push(rand);
        if (rand >= 1 && rand <= 15) {
          this.currentCall = "B_" + rand;
          this.calledNumbersLetters.push(this.currentCall);
        } else if (rand >= 16 && rand <= 30) {
          this.currentCall = "I_" + rand;
          this.calledNumbersLetters.push(this.currentCall);
        } else if (rand >= 31 && rand <= 45) {
          this.currentCall = "N_" + rand;
          this.calledNumbersLetters.push(this.currentCall);
        } else if (rand >= 46 && rand <= 60) {
          this.currentCall = "G_" + rand;
          this.calledNumbersLetters.push(this.currentCall);
        } else {
          this.currentCall = "O_" + rand;
          this.calledNumbersLetters.push(this.currentCall);
        }
        this.colorSquare(rand, this.player.settings.cards);
      }
    },

    lineBingo() {
      this.goal = "line";
      document.getElementById("bLine").style.backgroundColor = "#4286f4";
      document.getElementById("bLine").disabled = true;
      document.getElementById("bFull").disabled = true;
      document.getElementById("bFull").style.backgroundColor = "#grey";
    },

    fullBingo() {
      this.goal = "full";
      document.getElementById("bFull").style.backgroundColor = "#4286f4";
      document.getElementById("bFull").disabled = true;
      document.getElementById("bLine").disabled = true;
      document.getElementById("bLine").style.backgroundColor = "#grey";
    },

    checkForBingo() {
      if (this.goal == "line") {
        this.checkVerticalBingo();
        this.checkHorizontalBingo();
        this.checkDiagonalBingo();
        this.checkCornersBingo();
      } else {
        this.checkFullBingo();
      }
    },

    checkVerticalBingo() {
      for (var i = 0; i < 5; i++) {
        var sq1 = document.getElementById("sq" + i);
        var sq2 = document.getElementById("sq" + (i + 5));
        var sq3 = document.getElementById("sq" + (i + 10));
        var sq4 = document.getElementById("sq" + (i + 15));
        var sq5 = document.getElementById("sq" + (i + 20));

        this.checkLines(sq1, sq2, sq3, sq4, sq5);
      }
    },

    checkHorizontalBingo() {
      var sq1, sq2, sq3, sq4, sq5;
      for (var i = 0; i < 5; i++) {
        switch (i) {
          case 0:
            sq1 = document.getElementById("sq" + i);
            sq2 = document.getElementById("sq" + (i + 1));
            sq3 = document.getElementById("sq" + (i + 2));
            sq4 = document.getElementById("sq" + (i + 3));
            sq5 = document.getElementById("sq" + (i + 4));
            break;
          case 1:
            sq1 = document.getElementById("sq" + (i + 4));
            sq2 = document.getElementById("sq" + (i + 5));
            sq3 = document.getElementById("sq" + (i + 6));
            sq4 = document.getElementById("sq" + (i + 7));
            sq5 = document.getElementById("sq" + (i + 8));
            break;
          case 2:
            sq1 = document.getElementById("sq" + (i + 8));
            sq2 = document.getElementById("sq" + (i + 9));
            sq3 = document.getElementById("sq" + (i + 10));
            sq4 = document.getElementById("sq" + (i + 11));
            sq5 = document.getElementById("sq" + (i + 12));
            break;
          case 3:
            sq1 = document.getElementById("sq" + (i + 12));
            sq2 = document.getElementById("sq" + (i + 13));
            sq3 = document.getElementById("sq" + (i + 14));
            sq4 = document.getElementById("sq" + (i + 15));
            sq5 = document.getElementById("sq" + (i + 16));
            break;
          case 4:
            sq1 = document.getElementById("sq" + (i + 16));
            sq2 = document.getElementById("sq" + (i + 17));
            sq3 = document.getElementById("sq" + (i + 18));
            sq4 = document.getElementById("sq" + (i + 19));
            sq5 = document.getElementById("sq" + (i + 20));
            break;
        }
        this.checkLines(sq1, sq2, sq3, sq4, sq5);
      }
    },

    checkDiagonalBingo() {
      var sq1, sq2, sq3, sq4, sq5;
      for (var i = 0; i < 2; i++) {
        switch (i) {
          case 0:
            sq1 = document.getElementById("sq" + 0);
            sq2 = document.getElementById("sq" + 6);
            sq3 = document.getElementById("sq" + 12);
            sq4 = document.getElementById("sq" + 18);
            sq5 = document.getElementById("sq" + 24);
            break;
          case 1:
            sq1 = document.getElementById("sq" + 4);
            sq2 = document.getElementById("sq" + 8);
            sq3 = document.getElementById("sq" + 12);
            sq4 = document.getElementById("sq" + 16);
            sq5 = document.getElementById("sq" + 20);
            break;
        }
        this.checkLines(sq1, sq2, sq3, sq4, sq5);
      }
    },

    checkCornersBingo() {
      var sq1 = document.getElementById("sq" + 0);
      var sq2 = document.getElementById("sq" + 4);
      var sq3 = document.getElementById("sq" + 20);
      var sq4 = document.getElementById("sq" + 24);

      if (
        sq1.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq1.value)) &&
        sq2.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq2.value)) &&
        sq3.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq3.value)) &&
        sq4.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq4.value))
      ) {
        this.youWinCorners(sq1, sq2, sq3, sq4);
        return;
      } else {
        document.getElementById("currentCall").innerHTML =
          "Not a valid bingo! Keep trying!";
        return;
      }
    },

    checkFullBingo() {
      var j = 0;
      var flag = false;
      for (var i = 0; i < 5; i++) {
        var sq1 = document.getElementById("sq" + j);
        j++;
        var sq2 = document.getElementById("sq" + j);
        j++;
        var sq3 = document.getElementById("sq" + j);
        j++;
        var sq4 = document.getElementById("sq" + j);
        j++;
        var sq5 = document.getElementById("sq" + j);
        j++;

        if (
          sq1.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq1.value)) &&
          sq2.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq2.value)) &&
          sq3.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq3.value)) &&
          sq4.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq4.value)) &&
          sq5.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq5.value))
        ) {
          flag = true;
        } else if (
          sq1.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq1.value)) &&
          sq2.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq2.value)) &&
          sq3.value == "FREE" &&
          sq4.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq4.value)) &&
          sq5.style.backgroundColor == "lightblue" &&
          this.calledNumbers.includes(parseInt(sq5.value))
        ) {
          flag = true;
        } else {
          flag = false;
          break;
        }
      }
      if (flag == true) {
        this.youWinFullBingo();
      } else {
        document.getElementById("currentCall").innerHTML =
          "Not a valid bingo! Keep trying!";
        return;
      }
    },
    checkLines(sq1, sq2, sq3, sq4, sq5) {
      if (
        sq1.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq1.value)) &&
        sq2.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq2.value)) &&
        sq3.value == "FREE" &&
        sq4.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq4.value)) &&
        sq5.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq5.value))
      ) {
        this.youWin(sq1, sq2, sq3, sq4, sq5);
        return;
      } else if (
        sq1.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq1.value)) &&
        sq2.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq2.value)) &&
        sq3.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq3.value)) &&
        sq4.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq4.value)) &&
        sq5.style.backgroundColor == "lightblue" &&
        this.calledNumbers.includes(parseInt(sq5.value))
      ) {
        this.youWin(sq1, sq2, sq3, sq4, sq5);
        return;
      } else {
        document.getElementById("currentCall").innerHTML =
          "Not a valid bingo! Keep trying!";
        return;
      }
    },

    youWin(sq1, sq2, sq3, sq4, sq5) {
      sq1.style.backgroundColor = "yellow";
      sq2.style.backgroundColor = "yellow";
      sq3.style.backgroundColor = "yellow";
      sq4.style.backgroundColor = "yellow";
      sq5.style.backgroundColor = "yellow";
      document.getElementById("bCall").disabled = true;
      document.getElementById("bBingo").disabled = true;
      document.getElementById("currentCall").innerHTML = "BINGO!";
      alert("BINGO! You win!");
      throw new Error("Not an error! Just finishes any execution of the game!");
    },

    youWinCorners(sq1, sq2, sq3, sq4) {
      sq1.style.backgroundColor = "yellow";
      sq2.style.backgroundColor = "yellow";
      sq3.style.backgroundColor = "yellow";
      sq4.style.backgroundColor = "yellow";
      document.getElementById("bCall").disabled = true;
      document.getElementById("bBingo").disabled = true;
      document.getElementById("currentCall").innerHTML = "BINGO!";
      alert("BINGO! You win!");
      throw new Error("Not an error! Just finishes any execution of the game!");
    },

    youWinFullBingo() {
      document.getElementById("bCall").disabled = true;
      document.getElementById("bBingo").disabled = true;
      document.getElementById("currentCall").innerHTML = "BINGO!";
      alert("BINGO! You win!");
      throw new Error("Not an error! Just finishes any execution of the game!");
    }
  },
  created() {
    for (var k = 0; k < parseInt(this.player.settings.cards); k++)
      this.generateNewCard(k);
    console.log(this.player.settings.cards);
  }
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
