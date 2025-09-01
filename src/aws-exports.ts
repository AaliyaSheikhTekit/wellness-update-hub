// aws-exports.ts
import { ResourcesConfig } from "aws-amplify";

const awsconfig: ResourcesConfig = {
  Auth: {
    Cognito: {
      userPoolId: "eu-north-1_GSO0Wqfrt",
      userPoolClientId: "5il0mmtqno8kn2rpatfobnfb6",
      identityPoolId: "eu-north-1:eeab17e7-2104-43b5-8da9-4537ab0a8e5d", // only if you created one
    },
  },
};

export default awsconfig;
