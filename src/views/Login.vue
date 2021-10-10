<template>
  <button @click="login()">TESTE</button>
</template>

<script>
import { defineComponent } from "@vue/runtime-core";
import googleApiService from "../services/gapi.service";

export default defineComponent({
  name: "Login",
  components: {},
  methods: {
    login() {
      googleApiService.getAuthInstance().subscribe({
        next: (googleAuth) => {
          console.log(googleAuth);
          googleApiService
            .getSignInStateChange()
            .subscribe({ next: this.signInStateListener });
            googleAuth.signIn();
        },
      });
    },
    signInStateListener(value) {
      if (value) {
        // this.$router.push({ path: "/folder/inbox" });
        console.log(value)
      } else {
        console.log("deslogou", value);
      }
    },
  },
});
</script>

<style>
</style>