<template>
    <div class="home">
        <keep-alive>
            <component
                v-bind:is="currentViewComponent"
                @updateName="updateName"
                @updateView="updateView"
                @updateSettings="updateSettings"
                @updateCards="updateCards"
                :player="player"
            ></component>
        </keep-alive>
        <p>Nombre del jugador : {{ player.name }}</p>
        <p>
            Configuraciones : <br />
            Modo de juego: {{ player.settings.mode }} <br />
            Cartones: {{ player.settings.cards }}
        </p>
        <p>Esta conectado a server: {{ is_connect }}</p>
    </div>
</template>

<script>
// @ is an alias to /src
import Intro from "@/components/Intro.vue";
import Board from "@/components/Board.vue";
import Mode from "@/components/Mode.vue";

export default {
    name: "Home",
    components: {
        Intro,
        Board,
        Mode,
    },
    data() {
        return {
            is_connect: false,
            player: {
                name: "",
                settings: {
                    mode: "",
                    cards: 0,
                },
            },
            currentView: "Intro",
            views: ["Board", "Intro", "Mode"],
        };
    },
    sockets: {
        connect: function() {
            // Fired when the socket connects.
            this.is_connect = true;
            console.log("socket connected ");
        },
        disconnect() {
            this.is_connect = false;
        },
        confModo(modo) {
            //Recibe modo de juego
            //Linea , Completo

            this.player.settings.mode = modo;
            this.updateView("Board");
        },
        /* youTurn() {
            //turno de sacar numero
            //1-AQUI HAY QUE LLAMAR A SACAR NUMERO
            //2- Transmitirlo con enviarNumero()
            console.log("Estoy en GAME");
        },*/
        /*numNew(num) {
            //NUMERO RECIBIDO
            console.log(num);

            //1-Actualizar tablero
            //2-Comprobar bingo propio
            //3-Llamar enviarNumero(num) para reenviar a pc de a lado
        },*/
        /*bingoEnd() {
            //Recibes si Gano alguien
            //Mostrar mensaje - FIN
        },*/
    },
    computed: {
        currentViewComponent: function() {
            return this.currentView;
        },
    },
    methods: {
        enviarIniciarJuego(modo) {
            console.log("enviarIniciarJuego ", modo);
            this.$socket.client.emit("emit_iniciar", modo);
        },
        updateName(name) {
            this.player.name = name;
            this.$socket.client.emit("emit_nombre", name); //Prueba de emitir nombre a server
        },
        updateView(view) {
            this.currentView = view;
        },
        updateCards(settings) {
            this.player.settings.cards = settings.cards;
        },
        updateSettings(settings) {
            this.player.settings.mode = settings.mode;
            this.player.settings.cards = settings.cards;

            this.enviarIniciarJuego(settings.mode);
        },
    },
};
</script>
