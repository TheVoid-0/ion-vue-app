<template>
  <div>
    <ion-button @click="login()">Sign In</ion-button>
  </div>
</template>

<script>
import { defineComponent } from "@vue/runtime-core";
import { IonButton } from "@ionic/vue";
import googleApiService from "../services/gapi.service";

export default defineComponent({
  name: "Login",
  components: {
    IonButton,
  },
  methods: {
    login() {
      googleApiService.getAuthInstance().then((googleAuth) => {
        console.log(googleAuth, 'Login.vue AuthInstance inicializado');

        googleApiService
          .getSignInStateChange()
          .subscribe({ next: this.signInStateListener });

        googleAuth.signIn().then(async () => {
          console.log("signIn");
          const user = await googleApiService.getCurrentUser();
          this.$router.push({
            path: `/dashboard/${user.getBasicProfile().getName()}`,
          });

        });

      });
      
    },
    async signInStateListener(value) {
      console.log("signInStateListener");
      if (value) {
        const user = await googleApiService.getCurrentUser();
        console.log("current user", user);
        console.log(value);
      } else {
        console.log("deslogou", value);
      }
    },
  },
});
</script>

<style scoped>
div {
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>