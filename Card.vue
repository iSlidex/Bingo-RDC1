<template>
  <v-content>
    <v-simple-table>
      <template v-slot:default>
        <thead>
          <tr>
            <th class="header">B</th>
            <th class="header">I</th>
            <th class="header">N</th>
            <th class="header">G</th>
            <th class="header">Oasdsd</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in 5" :key="item.id">
            <td>{{ card.B[item - 1] }}</td>
            <td>{{ card.I[item - 1] }}</td>
            <td>{{ card.N[item - 1] }}</td>
            <td>{{ card.G[item - 1] }}</td>
            <td>{{ card.O[item - 1] }}</td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
  </v-content>
</template>

<script>
export default {
  props: ["player"],
  data() {
    return {
      card: {
        B: { 0: "1", 1: "2", 2: "3", 3: "4", 4: "5" },
        I: { 0: "6", 1: "7", 2: "8", 3: "9", 4: "10" },
        N: { 0: "11", 1: "12", 2: "LIBRE", 3: "14", 4: "15" },
        G: { 0: "16", 1: "17", 2: "18", 3: "19", 4: "20" },
        O: { 0: "21", 1: "22", 2: "23", 3: "24", 4: "25" }
      },
      boleta: [25]
    };
  },
  computed: {
    usedNumbers: function() {
      return new Array(76);
    },
    calledNumbers: function() {
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
    generateNewCard() {
      // set all elements in usedNumbers array as false
      this.resetUsedNumbers();
      // loops 24 times because there are 24 squares (not including free square)
      for (var i = 0; i < 25; i++) {
        if (i == 12)
          // skip free square
          continue;
        // generates a number for each square
        this.generateSquare(i);
      }
    },

    generateSquare(squareNum) {
      // generates random number for each square (depends on column)
      var newNumber = (squareNum % 5) * 15 + this.generateNewNum();
      // loop makes sure there are no duplicates
      while (this.usedNumbers[newNumber] == true) {
        newNumber = (squareNum % 5) * 15 + this.generateNewNum();
      }
      // sets the used number in the array as true so no duplicates
      this.usedNumbers[newNumber] = true;
      // sets the current square to the new number
      switch (squareNum % 5) {
        case 0:
          {
            this.card.B[~~(squareNum / 5)] = newNumber;
          }
          break;
        case 1:
          {
            this.card.I[~~(squareNum / 5)] = newNumber;
          }
          break;
        case 2:
          {
            this.card.N[~~(squareNum / 5)] = newNumber;
          }
          break;
        case 3:
          {
            this.card.G[~~(squareNum / 5)] = newNumber;
          }
          break;
        case 4:
          {
            this.card.O[~~(squareNum / 5)] = newNumber;
          }
          break;
        default:
          "";
      }
    },

    generateNewNum() {
      // generates a random numbers between 1 and 15
      return Math.floor(Math.random() * 15 + 1); //15
    },

    resetUsedNumbers() {
      // sets all elements of the usedNumbers array to false (resets the array)
      for (var i = 0; i < this.usedNumbers.length; i++) {
        this.usedNumbers[i] = false;
      }
    },

    // when clicked, generates a new random card
    generateAnotherCard() {
      this.resetUsedNumbers();
      this.generateNewCard();
      this.resetSquareColours();
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

    callNumber() {
      var rand = Math.floor(Math.random() * 75) + 1; // random number between 1 and 75
      // if the number is in the array (already been called)
      if (this.calledNumbers.includes(rand)) this.callNumber();
      else {
        this.calledNumbers.push(rand);
        if (rand >= 1 && rand <= 15)
          document.getElementById("currentCall").innerHTML = "B" + rand;
        else if (rand >= 16 && rand <= 30)
          document.getElementById("currentCall").innerHTML = "I" + rand;
        else if (rand >= 31 && rand <= 45)
          document.getElementById("currentCall").innerHTML = "N" + rand;
        else if (rand >= 46 && rand <= 60)
          document.getElementById("currentCall").innerHTML = "G" + rand;
        else document.getElementById("currentCall").innerHTML = "O" + rand;
        document.getElementById("calledNums").innerHTML = this.calledNumbers;
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
    this.generateNewCard();
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
  background: #f44242;
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
