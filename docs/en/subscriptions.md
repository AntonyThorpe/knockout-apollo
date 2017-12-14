# Subscriptions

## Getting Started in Knockout
```javascript
// Initialise via a Custom Function in your viewModel
var self = this;
self.todoList = ko.observableArray().launchApollo(apolloClient, defaultErrorCallback).liftOffSubscription(apolloClient, defaultErrorCallbackForSubscription);

// Next step: populate via a query.
```
Note: the above errorCallbacks are optional.  The default is to `console.error` any error.

## Server
On the server add the Subscription to your schema:
```javascript
// Schema (imports/api/schema.js)
export const schema = `

type TodoList {
  _id: ID
  task: String
  completed: Boolean
}

type Result {
  status: String
  value: TodoList
}

type Query {
  todoList(_id: ID): [TodoList]
}

type Mutation {
  createTodo(task: String!, completed: Boolean!): TodoList
  updateTodo(_id: ID!, task: String!, completed: Boolean!): TodoList
  removeTodo(_id: ID!): TodoList
}

type Subscription {
  todoList: Result
}

schema {
  query: Query
  mutation: Mutation
  subscription: Subscription
}
`;
```

Create a Pubsub instance (server/pubsub.js) to be shared with the initialisation of the server, the publish event from the model and the Resolvers.
```javascript
import { PubSub } from "graphql-subscriptions";
const pubsub = new PubSub();
export { pubsub };
```

Below example is for a Meteor (with Astronomy & Apollo modules) and an Express Server (tests/server/main.js).
```javascript
// GraphQL
import { createApolloServer } from 'meteor/apollo';
import { makeExecutableSchema } from 'graphql-tools';
const cors = require('cors');
import { TodoList } from "/imports/models/TodoList.js";
import { typeDefs } from '/imports/api/schema';
import { resolvers } from '/imports/api/resolvers';

// Subscriptions
import { WebApp } from 'meteor/webapp';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';

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
        graphQLServer.use(cors());
    }
});

// Subscriptions
// Reference: https://www.apollographql.com/docs/graphql-subscriptions/setup.html

new SubscriptionServer({
  schema: schema,
  execute,
  subscribe,
}, {
  server: WebApp.httpServer,
  path: '/subscriptions',
});
```

Import the pubsub instance into your model and publish upon a change event.  The below example utilises [Astronomy](http://jagi.github.io/meteor-astronomy/), a [Meteor](http://docs.meteor.com) package, that has an event hook feature.
```javascript
import { Class } from 'meteor/jagi:astronomy';
import { pubsub } from "/server/pubsub";

const TodoListCollection = new Mongo.Collection('todoList');

const TodoList = Class.create({
    name: 'TodoList',
    collection: TodoListCollection,
    fields: {
        _id: {
            type: String,
            optional: true
        },
        task: {
            type: String,
            optional: true
        },
        completed: {
            type: Boolean,
            optional: true
        }
    },
    events: {
        afterInsert(e) {
            pubsub.publish('todoList', {
                status: "added",
                value: e.currentTarget
            });
        },
        afterUpdate(e) {
            pubsub.publish('todoList', {
                status: "updated",
                value: e.currentTarget
            });
        },
        afterRemove(e) {
            pubsub.publish('todoList', {
                status: "deleted",
                value: e.currentTarget
            });
        }
    }
});
```
Then in the Resolver (imports/api/resolver.js)
```javascript
import { pubsub } from "/server/pubsub";  // also access the pubsub instance

export const resolvers = {
    Query: {
        ...
    },
    Mutation: {
        ...
    },
    Subscription: {
        todoList: {
            resolve: (data, args, context, info) => {
                    return data;
            },
            subscribe: () => pubsub.asyncIterator("todoList"),
        }
    }
};
```


## Client
On the client within a viewModel:
```javascript
// Create the GraphQL document
var graphqlDocumentTodoList = gql`
  subscription {
    todoList {
      status
      value {
        _id
        task
        completed
      }
    }
  }
`;

// subscribe to changes and adjust the knockout observableArray
self.todoList.startGraphqlSubscription(
    {
      query: graphqlDocumentTodoList,
    },
    {
        next: function(data) {
            switch (data.todoList.status) {
                case "added":
                  self.todoList.insert(data.data.todoList.value);
                  break;
                case "updated":
                  self.todoList.upsert(data.data.todoList.value);
                  break;
                case "deleted":
                  var _id = data.data.todoList.value._id;
                  var exists = ko.utils.arrayFirst(self.todoList.peek(), function(item) {
                      return ko.unwrap(item._id) === _id;
                  });
                  if (exists) {
                      self.todoList.remove(exists);
                  }
                  break;
            }
        }
    }
  );
```

### Subscription
You will find the subscription available:
```javascript
self.yourObservable.graphqlSubscription
```
if you need to cancel the subscription at a certain stage in the future.

### Vanilla Subscription
One could always just use the Apollo Client straight:
```javascript
apolloClient.subscribe({
    query: graphqlDocumentTodoList
}).subscribe({
    next (data) {
        // Do your stuff
    }
});
```

## Index
[Link](index.md)
