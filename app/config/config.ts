// var config: any = {
//     production: {
//         database: {
//             DB_NAME: "fuse2",
//             DB_USERNAME: "admin",
//             DB_PASSWORD: "Admin@123",
//             DB_HOST: "localhost",
//             DIALECT: "mysql",
//             LOGGING: false
//         },
//         SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
//         SERVER_PORT: '3000',
//         TOKEN_EXPIRES_IN: 361440, //1 day in seconds
//         REFRESH_TOKEN_EXPIRES_IN: 361440 //1 day in seconds
//     },
//     development: {
//         database: {
//             DB_NAME: "mydbdemo",
//             DB_USERNAME: "root",
//             DB_PASSWORD: "Admin@123",
//             DB_HOST: "localhost",
//             DIALECT: "mysql",
//             LOGGING: false
//         },
//         SECURITY_TOKEN: 'Fuse2ServerSecurityKey',
//         SERVER_PORT: '8000',
//         TOKEN_EXPIRES_IN: 361440, //1 day in seconds
//         REFRESH_TOKEN_EXPIRES_IN: 361440 //1 day in seconds
//         // TOKEN_EXPIRES_IN: 300 //5 min in seconds
//     }
// }

// export function get(env: any) {
//     return config[env] || config.development;
// }



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

