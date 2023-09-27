export type AmplifyConfig = {
  Auth: {
    region: string;
    identityPoolId: string;
  };
  Storage: {
    AWSS3: {
      region: string;
      bucket: string;
      customPrefix: {
        public: string;
      };
    };
  };
};
