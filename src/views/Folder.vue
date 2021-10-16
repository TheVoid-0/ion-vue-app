<template>
  <ion-page>
    <ion-header :translucent="true">
      <ion-toolbar>
        <ion-buttons slot="start">
          <ion-menu-button color="primary"></ion-menu-button>
        </ion-buttons>
        <ion-title>{{ id }}</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">{{ id }}</ion-title>
        </ion-toolbar>
      </ion-header>

      <div id="container">
        <strong class="capitalize">{{ $route.params.id }}</strong>
        <br>
        <ion-button @click="signOut()">Sign out</ion-button>
      </div>

      <ion-fab vertical="bottom" horizontal="end" slot="fixed">
        <ion-fab-button>
          <ion-icon :icon="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  </ion-page>
</template>

<script lang="ts">
import googleApiService from "../services/gapi.service";

import {
  IonButtons,
  IonContent,
  IonHeader,
  IonMenuButton,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonFab,
  IonFabButton,
  IonButton
} from "@ionic/vue";

import { add } from "ionicons/icons";

import { defineComponent } from "vue";

export default defineComponent({
  name: "Folder",
  props: {
    id: { type: String, required: true },
  },
  components: {
    IonButtons,
    IonContent,
    IonHeader,
    IonMenuButton,
    IonPage,
    IonTitle,
    IonToolbar,
    IonIcon,
    IonFab,
    IonFabButton,
    IonButton
  },
  setup() {
    return {
      add,
    };
  },
  methods: {
    signOut() {
      googleApiService.getAuthInstance().subscribe({
        next: (googleAuth) => {
          googleAuth.signOut().then(() => {
            googleAuth.currentUser.get().reloadAuthResponse();
            location.href = 'login';
          });
        },
      });
    },
  },
});
</script>

<style scoped>
#container {
  text-align: center;
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
}

#container strong {
  font-size: 20px;
  line-height: 26px;
}

#container p {
  font-size: 16px;
  line-height: 22px;
  color: #8c8c8c;
  margin: 0;
}

#container a {
  text-decoration: none;
}
</style>