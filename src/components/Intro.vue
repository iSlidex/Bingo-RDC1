<template>
  <v-content>
    <v-container class="fill-height" fluid>
      <v-row align="center" justify="center">
        <v-col cols="12" sm="8" md="4">
          <v-card class="elevation-12">
            <v-toolbar color="primary" dark flat>
              <v-toolbar-title>DuoBingo</v-toolbar-title>
              <v-spacer />
            </v-toolbar>
            <v-container>
              <v-card-text>
                <p class="pl-8 mt-2 mb-n1">
                  Hola, ingresa tu nombre para comenzar a jugar:
                </p>
                <v-form v-on:submit.prevent="enviar">
                  <v-text-field
                    label="Nombre"
                    name="login"
                    prepend-icon="person"
                    type="text"
                    v-model="nombre"
                  />
                </v-form>
              </v-card-text>
              <v-card-actions>
                <v-spacer />
                <v-btn @click="enviar" color="primary">Continuar</v-btn>
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
      nombre: ""
    };
  },
  methods: {
    enviar() {
      this.$emit("updateName", this.nombre);
      this.$emit("updateView", "Mode");
    }
  }
};
</script>
