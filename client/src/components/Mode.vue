<template>
    <v-content>
        <v-container class="fill-height" fluid>
            <v-row align="center" justify="center">
                <v-col cols="12" sm="8" md="4">
                    <v-card class="elevation-12">
                        <v-toolbar color="primary" dark flat>
                            <v-toolbar-title>Configuración</v-toolbar-title>
                            <v-spacer />
                        </v-toolbar>
                        <v-container>
                            <v-card-text>
                                <!-- MENU -->
                                <div v-show="status == 'menu'">
                                    <v-btn
                                        @click="status = 'newGame'"
                                        color="primary"
                                        block
                                        class="mb-2"
                                        >Crear partida</v-btn
                                    >
                                    <v-btn
                                        @click="status = 'joinGame1'"
                                        color="primary"
                                        block
                                        outlined
                                        >Unirse a partida</v-btn
                                    >
                                </div>

                                <!-- ESPERA FAKE A EVENTO -->
                                <div class="text-center" v-show="status == 'joinGame2'">
                                    <v-progress-circular
                                        indeterminate
                                        color="primary"
                                    ></v-progress-circular>
                                </div>

                                <!-- UI PARA CREAR PARTIDA -->
                                <v-form v-on:submit.prevent="enviar" v-show="status != 'menu'">
                                    <v-radio-group
                                        v-model="settings.mode"
                                        v-show="status == 'newGame'"
                                    >
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
                                    <v-radio-group
                                        v-model="settings.cards"
                                        v-show="status == 'newGame' || status == 'joinGame1'"
                                    >
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
                                    <v-switch
                                    v-model="switch1"
                                    :label="`Jugar automático: ${switch1.toString()}`"
                                    ></v-switch>
                                </v-form>
                            </v-card-text>
                            <v-card-actions>
                                <v-spacer />
                                <v-btn
                                    @click="enviar"
                                    color="primary"
                                    v-show="status != 'menu' && status != 'joinGame2'"
                                    >Jugar</v-btn
                                >
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
                cards: "1",
            },
            status: "menu",
            switch1: false,
        };
    },
    methods: {
        enviar() {
            if (this.status == "joinGame1") {
                this.status = "joinGame2";
                this.$emit("updateAuto", this.switch1);
                this.$emit("updateCards", this.settings);
            } else {
                this.$emit("updateAuto", this.switch1);
                this.$emit("updateSettings", this.settings);
                this.$emit("updateView", "Board");
            }
        },
    },
};
</script>
