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
            console.log("socket connected");
        },

        disconnect() {
            this.is_connect = false;
        },

        success() {
            console.log("socket connected");
            this.is_connect = true;
        },
    },
    computed: {
        currentViewComponent: function() {
            return this.currentView;
        },
    },
    methods: {
        updateName(name) {
            this.player.name = name;
            this.$socket.emit("emit_nombre", name);
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
