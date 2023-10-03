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
  API: {
    endpoints: { name: string; endpoint: string; region: string }[];
  };
};

export type Product = {
  id: string;
  title: string;
  image: string;
  categories: string[];
};
