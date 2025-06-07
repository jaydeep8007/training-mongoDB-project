

var config: any = {
  production: {
    database: {
      MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/training-mongoDB-project",
    },
    SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
    SERVER_PORT: '8000',
    TOKEN_EXPIRES_IN: 361440,
    REFRESH_TOKEN_EXPIRES_IN: 361440,
  },
  development: {
    database: {
      MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/training-mongoDB-project",
    },
    SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
    SERVER_PORT: '8000',
    TOKEN_EXPIRES_IN: 361440,
    REFRESH_TOKEN_EXPIRES_IN: 361440,
  },
};

export function get(env: any) {
  return config[env] || config.development;
}

