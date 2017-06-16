import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';


// GraphQL
import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema, addMockFunctionsToSchema } from 'graphql-tools';
const cors = require('cors');
import { TodoList } from "/imports/models/TodoList.js";
import { typeDefs } from '/imports/api/schema';
import { resolvers } from '/imports/api/resolvers';

// Subscriptions
// Reference: http://dev.apollodata.com/tools/graphql-subscriptions/meteor.html
import { WebApp } from 'meteor/webapp';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { SubscriptionManager } from "graphql-subscriptions";
import { pubsub } from "./pubsub";


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
            // @see https://github.com/expressjs/cors for customization
            graphQLServer.use(cors());
        }
    }
});

// Subscriptions
// Reference: http://dev.apollodata.com/tools/graphql-subscriptions/meteor.html
// and meteornl/ticker
const subscriptionManager = new SubscriptionManager({
    schema: schema,
    pubsub: pubsub,
});
new SubscriptionServer({
    subscriptionManager: subscriptionManager,
}, {
    server: WebApp.httpServer,
    path: '/subscriptions',
});

