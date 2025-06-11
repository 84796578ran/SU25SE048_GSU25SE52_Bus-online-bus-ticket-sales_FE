// server.js (Backend)
const { ApolloServer } = require('apollo-server');
const typeDefs = require('./schema');
const resolvers = require('./resolvers');
const db = require('./database'); // Kết nối database

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: () => ({ db }) // Truyền db vào context để sử dụng trong resolvers
});

server.listen({ port: 4000 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});