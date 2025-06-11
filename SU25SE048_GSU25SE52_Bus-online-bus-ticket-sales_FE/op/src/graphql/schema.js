// schema.js
const { gql } = require('apollo-server');

const typeDefs = gql`
  type Trip {
    id: ID!
    TripID: String!
    timeStart: String!
    timeEnd: String!
    FromLocation: String!
    EndLocation: String!
    price: Float!
  }

  type Query {
    searchTrips(
      FromLocation: String!
      EndLocation: String!
      price: Float
      timeStart: String
      timeEnd: String
    ): [Trip]
  }
`;

module.exports = typeDefs;