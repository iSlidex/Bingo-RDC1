<template>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>Da Mode</v-toolbar-title>
              <v-spacer />
            </v-toolbar>
            <v-container>
              <v-card-text>
                <v-form v-on:submit.prevent="enviar">
                  <v-radio-group v-model="settings.mode">
                    <template v-slot:label>
                      <p>{{ player.name }}, elige la modalidad de juego:</p>
                    </template>
                    <v-radio value="completo">
                      <template v-slot:label>
                        <div>A carton completo</div>
                      </template>
                    </v-radio>
                    <v-radio value="linea">
                      <template v-slot:label>
                        <div>A una linea</div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                  <v-radio-group v-model="settings.cards">
                    <template v-slot:label>
                      <p>Elige la cantidad de cartones:</p>
                    </template>
                    <v-radio value="1">
                      <template v-slot:label>
                        <div>Un carton</div>
                      </template>
                    </v-radio>
                    <v-radio value="2">
                      <template v-slot:label>
                        <div>Dos cartones</div>
                      </template>
                    </v-radio>
                  </v-radio-group>
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn @click="enviar" color="primary">Jugar</v-btn>
              </v-card-actions>
            </v-container>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </v-content>
</template>

<script>
export default {
  props: ["player"],
  data() {
    return {
      settings: {
        mode: "completo",
        cards: "1"
      }
    };
  },
  methods: {
    enviar() {
      this.$emit("updateSettings", this.settings);
      this.$emit("updateView", "Board");
    }
  }
};
</script>
