// export const environment = {
//     production : false,
//     apiUrl : 'https://localhost:7197/api'
// };


// environment/environment.js
const dev = {
  production: false,
  apiUrl: 'https://localhost:7197/api'
};

const prod = {
  production: true,
  apiUrl: 'https://localhost:7197/api'
};

export const environment = process.env.NODE_ENV === 'production' ? prod : dev;
