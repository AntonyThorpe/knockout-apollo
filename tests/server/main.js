import { Meteor } from 'meteor/meteor';

// GraphQL
import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema } from 'graphql-tools';
const cors = require('cors');
import { TodoList } from "/imports/models/TodoList.js";
import { typeDefs } from '/imports/api/schema';
import { resolvers } from '/imports/api/resolvers';

// Subscriptions
// Reference: https://www.apollographql.com/docs/graphql-subscriptions/meteor.html
import { WebApp } from 'meteor/webapp';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

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

// Setup GraphQL
const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});
createApolloServer({
    schema,
},
{
    configServer: (graphQLServer) => {
        if (Meteor.isDevelopment) {
            // Enable unrestricted cors only in development
            graphQLServer.use(cors());
        }
    }
});

// Subscriptions
// Reference: https://www.apollographql.com/docs/graphql-subscriptions/setup.html
// and meteornl/ticker
new SubscriptionServer({
  schema: schema,
  execute,
  subscribe,
}, {
  server: WebApp.httpServer,
  path: '/subscriptions',
});
