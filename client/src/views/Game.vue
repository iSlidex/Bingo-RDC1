<template>
    <div class="home">
        <keep-alive>
            <component
                v-bind:is="currentViewComponent"
                @updateName="updateName"
                @updateView="updateView"
                @updateSettings="updateSettings"
                :player="player"
            ></component>
        </keep-alive>
        <p>Name : {{ player.name }}</p>
        <p>
            Einstellungen : Modus: {{ player.settings.mode }} Karten:
            {{ player.settings.cards }}
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
        youTurn() {
            //turno de sacar numero
            //AQUI HAY QUE LLAMAR A SACAR NUMERO
        },
        numNew(num) {
            //NUMERO RECIBIDO
            console.log(num);
        },
    },
    computed: {
        currentViewComponent: function() {
            return this.currentView;
        },
    },
    methods: {
        enviarTurnoListo() {
            this.$socket.client.emit("emit_nt");
        },
        enviarBingoPropio() {
            this.$socket.client.emit("emit_bingo");
        },
        enviarNumero(num) {
            this.$socket.client.emit("emit_numero", num);
        },
        updateName(name) {
            this.player.name = name;
            this.$socket.client.emit("emit_nombre", name); //Prueba de emitir nombre a server
        },
        updateView(view) {
            this.currentView = view;
        },
        updateSettings(settings) {
            this.player.settings.mode = settings.mode;
            this.player.settings.cards = settings.cards;
        },
    },
};
</script>
