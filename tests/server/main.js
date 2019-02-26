import { Meteor } from "meteor/meteor";

// GraphQL
const { ApolloServer, gql } = require('apollo-server-hapi');
const Hapi = require('hapi');

import { TodoList } from "/imports/models/TodoList.js";
import { typeDefs } from "/imports/api/schema";
import { resolvers } from "/imports/api/resolvers";

// Populate database with initial data
Meteor.startup(() => {
    if (TodoList.find().count() === 0) {
        TodoList.insert({
            _id: "123",
            task: "start engines",
            completed: true
        });
        TodoList.insert({
            _id: "456",
            task: "check wings",
            completed: false
        });
        TodoList.insert({
            _id: "789",
            task: "test flaps",
            completed: false
        });
    }
});

/**
 * Server startup
 * @constructor
 */
async function StartServer() {
  const server = new ApolloServer({
      typeDefs,
      resolvers,
      cors: true,
      context: async ({ request, response }) => {
      return {};
  }
  });

  const app = new Hapi.server({
    port: 4000
  });


  await server.applyMiddleware({
    app,
  });

  await server.installSubscriptionHandlers(app.listener);

  await app.start();
}

StartServer().catch(error => console.log(error));
