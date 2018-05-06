# Installation and Configuration

## Queries and Mutations

### Load Libraries
```sh
npm install apollo-client apollo-link graphql-tag knockout knockout-apollo ko.plus jquery
```

### Import into the client
```javascript
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';
import gql from 'graphql-tag';
global.jQuery = require('jquery');
import ko from 'knockout';
require('ko.plus');
import 'knockout-apollo.js';
```

### Create an Apollo Client
[Docs](https://www.apollographql.com/docs/link/#apollo-client)

### Next Step
[Queries](queries.md) or [Mutations](mutations.md)


## Subscriptions
### Load Libraries
```sh
npm install subscriptions-transport-ws graphql
```

### Import into the client
```javascript
...
import { WebSocketLink } from 'apollo-link-ws';
import { getOperationAST } from 'graphql';
...
```

### Create an Apollo Client that includes a GraphQL Subscription connection

In the client:
```javascript
// Establish a GraphQL connection
const link = ApolloLink.split(
  operation => {
    const operationAST = getOperationAST(operation.query, operation.operationName);
    return !!operationAST && operationAST.operation === 'subscription';
  },
  new WebSocketLink({
    uri: 'ws://localhost:3000/subscriptions',
    options: {
      reconnect: true,
    }
  }),
  new HttpLink(
	  { uri: 'http://localhost:3000/graphql' }
  )
);

const cache = new InMemoryCache(window.__APOLLO_STATE);

const apolloClient = new ApolloClient({
  link,
  cache
});
```

#### References
* [Split example from the Apollo Docs](https://www.apollographql.com/docs/react/features/subscriptions.html#subscriptions-client)

### Next Step
[Subscriptions](subscriptions.md)
