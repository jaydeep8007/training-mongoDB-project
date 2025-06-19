

// var config: any = {
//   production: {
//     database: {
//       MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/training-mongoDB-project",
//     },
//     SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
//     SERVER_PORT: '8000',
//     TOKEN_EXPIRES_IN: 361440,
//     REFRESH_TOKEN_EXPIRES_IN: 361440,
//   },
//   development: {
//     database: {
//       MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/training-mongoDB-project",
//     },
//     SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
//     SERVER_PORT: '8000',
//     TOKEN_EXPIRES_IN: 361440,
//     REFRESH_TOKEN_EXPIRES_IN: 361440,
//   },
// };

// export function get(env: any) {
//   return config[env] || config.development;
// }


var config: any = {
  production: {
    database: {
      MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/training-mongoDB-project",
    },
    SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
    SERVER_PORT: '8000',
    TOKEN_EXPIRES_IN: 3600,               // 1 hour
    REFRESH_TOKEN_EXPIRES_IN: 7 * 24 * 3600, // 7 days
    COOKIE_OPTIONS: {
      secure: true,
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days in ms
    },
  },
  development: {
    database: {
      MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/training-mongoDB-project",
    },
    SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
    SERVER_PORT: '8000',
    TOKEN_EXPIRES_IN: 3600,               // 1 hour
    REFRESH_TOKEN_EXPIRES_IN: 7 * 24 * 3600, // 7 days
    COOKIE_OPTIONS: {
      secure: false,                      // for localhost testing
      httpOnly: true,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,    // 7 days
    },
  },
};

export function get(env: any) {
  return config[env] || config.development;
}