<template>
  <div class="home">
    <keep-alive>
    <component v-bind:is="currentViewComponent" @updateName="updateName" @updateView="updateView" @updateSettings="updateSettings" :player="player"></component>
    </keep-alive>
    <p>Name : {{player.name}}</p>
    <p>Einstellungen : Modus: {{player.settings.mode}} Karten: {{player.settings.cards}}</p>
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
    Mode
  },
  data(){
    return{
      player:{
        name: "",
        settings:{
          mode:"",
          cards:0,
        }
      },
      currentView:"Intro",
      views:["Board","Intro","Mode"]
    }
  },
  computed: {
          currentViewComponent: function() {
            return this.currentView;
          }
  },
  methods:{
    updateName(name){
      this.player.name=name;
    },
    updateView(view){
      this.currentView=view;
    },
    updateSettings(settings){
      this.player.settings.mode=settings.mode;
      this.player.settings.cards=settings.cards;
    }
  }
};
</script>
