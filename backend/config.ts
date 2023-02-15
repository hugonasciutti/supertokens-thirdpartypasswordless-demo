import ThirdPartyPasswordless, {
  Error,
} from "supertokens-node/recipe/thirdpartypasswordless";
import Session from "supertokens-node/recipe/session";
import { TypeInput } from "supertokens-node/types";
import Dashboard from "supertokens-node/recipe/dashboard";
import axios from "axios";

export const SuperTokensConfig: TypeInput = {
  supertokens: {
    // this is the location of the SuperTokens core.
    connectionURI: "https://try.supertokens.com",
  },
  appInfo: {
    appName: "SuperTokens Demo App",
    apiDomain: "http://localhost:3001",
    websiteDomain: "http://localhost:3000",
  },
  // recipeList contains all the modules that you want to
  // use from SuperTokens. See the full list here: https://supertokens.com/docs/guides
  recipeList: [
    ThirdPartyPasswordless.init({
      override: {
        functions(originalImplementation, builder) {
          return {
            ...originalImplementation,
            async createCode(input) {
              const { body } = input.userContext._default.request.request;
              const recaptcha: string = body.recaptcha;
              console.log("recaptcha", recaptcha);

              if (!recaptcha) {
                throw new Error({
                  type: "BAD_INPUT_ERROR",
                  message: "Recaptcha não informado.",
                });
              }

              const { data } = await axios(
                "https://www.google.com/recaptcha/api/siteverify",
                {
                  method: "POST",
                  data: {
                    secret: "6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe",
                    response: recaptcha,
                  },
                }
              );

              console.log("data", data);

              if (!data.success) {
                throw new Error({
                  type: "BAD_INPUT_ERROR",
                  message: "Recaptcha inválido.",
                });
              }

              return originalImplementation.createCode(input);
            },
          };
        },
      },
      providers: [
        // We have provided you with development keys which you can use for testing.
        // IMPORTANT: Please replace them with your own OAuth keys for production use.
        ThirdPartyPasswordless.Google({
          clientId:
            "1060725074195-kmeum4crr01uirfl2op9kd5acmi9jutn.apps.googleusercontent.com",
          clientSecret: "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",
        }),
        ThirdPartyPasswordless.Github({
          clientSecret: "e97051221f4b6426e8fe8d51486396703012f5bd",
          clientId: "467101b197249757c71f",
        }),
        ThirdPartyPasswordless.Apple({
          clientId: "4398792-io.supertokens.example.service",
          clientSecret: {
            keyId: "7M48Y4RYDL",
            privateKey:
              "-----BEGIN PRIVATE KEY-----\nMIGTAgEAMBMGByqGSM49AgEGCCqGSM49AwEHBHkwdwIBAQQgu8gXs+XYkqXD6Ala9Sf/iJXzhbwcoG5dMh1OonpdJUmgCgYIKoZIzj0DAQehRANCAASfrvlFbFCYqn3I2zeknYXLwtH30JuOKestDbSfZYxZNMqhF/OzdZFTV0zc5u5s3eN+oCWbnvl0hM+9IW0UlkdA\n-----END PRIVATE KEY-----",
            teamId: "YWQCXGJRJL",
          },
        }),
      ],
      contactMethod: "EMAIL_OR_PHONE",
      flowType: "USER_INPUT_CODE_AND_MAGIC_LINK",
    }),
    Dashboard.init({
      apiKey: "supertokens_is_awesome",
    }),
    Session.init({
      jwt: {
        enable: true,
      },
      override: {
        functions: function (originalImplementation) {
          return {
            ...originalImplementation,
            createNewSession: async function (input) {
              console.log("createNewSession", input);

              return originalImplementation.createNewSession(input);
            },
          };
        },
      },
    }),
  ],
};
