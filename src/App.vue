<template>
  <v-app>

    <amplify-authenticator>
      <surround-bars></surround-bars>
      <amplify-sign-up
        slot="sign-up"
        username-alias="email"
        :form-fields.prop="formFields"
      ></amplify-sign-up>
    </amplify-authenticator>


  </v-app>
</template>

<script>
export default {
  name: 'App',

  data: () => ({
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
    ],
  }),

};
</script>
