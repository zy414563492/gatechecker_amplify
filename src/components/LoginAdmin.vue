<template>
  <v-app>
    <amplify-authenticator>
      <amplify-sign-out></amplify-sign-out>
      <amplify-sign-up
        slot="sign-up"
        username-alias="email"
        :form-fields.prop="formFields"
      ></amplify-sign-up>
    </amplify-authenticator>
  </v-app>
</template>

<script>
// import { defineComponent } from 'vue'
// import { Authenticator } from "@aws-amplify/ui-vue"
import { onAuthUIStateChange } from '@aws-amplify/ui-components'

export default {
  name: 'login_admin',
  components: {
    // Authenticator,
  },
  data() {
    return {
      formFields: [
        {
          type: "email",
          label: "Email",
          placeholder: "example@hisrc.com",
          required: true,
        },
        {
          type: "password",
          label: "Password",
          // placeholder: "YourPassword",
          required: true,
        },
        {
          type: "nickname",
          label: "Nickname",
          placeholder: "Your nickname",
          required: true,
        },
      ]
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}

/* [data-amplify-authenticator] {
  --amplify-colors-background-primary: orange;
  --amplify-colors-background-secondary: yellow;
  --amplify-colors-background-tertiary: green;
  --amplify-components-text-color: purple;
} */
</style>
