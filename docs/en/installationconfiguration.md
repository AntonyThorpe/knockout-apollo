# Installation and Configuration

## Queries and Mutations

### Load Libraries
#### Option 1: Import
From the command line:
```sh
npm install --save apollo-client graphql-tag knockout knockout-apollo ko.plus jquery
```

Load the libraries into the client
```javascript
// set the JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST
import ApolloClient, {
    createNetworkInterface
} from 'apollo-client';
import gql from 'graphql-tag';
global.jQuery = require('jquery');
import ko from 'knockout';
require('ko.plus');
import 'knockout-apollo.js';
```


#### Option 2: Bundle
A little less flexible way is to install the above dependencies using bower and add as script tags to your html.  From the command line:
```sh
bower install --save knockout ko.plus jquery https://github.com/AntonyThorpe/knockout-apollo.git
```
Example below:
```html
<script type="text/javascript" src="bower_components/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="bower_components/knockout/dist/knockout.js"></script>
<script type="text/javascript" src="bower_components/ko.plus/src/ko.command.js"></script>
<script type="text/javascript" src="bower_components/knockout-apollo/dist/knockout-apollo.min.js"></script>
<script type="text/javascript" src="bower_components/knockout-apollo/dist/apollo.umd.bundle.min.js"></script>
```
The `apollo-client.umd.bundle.min.js` file exposes `ApolloClient`, `createNetworkInterface` (of the Apollo Client library) and `gql` (from GraphQL Tag).


### Create an Apollo Client
In the client:
```javascript
var apolloClient = new ApolloClient({
    networkInterface: createNetworkInterface({ uri: "https://yourwebsite.net/graphql"})
});
```

## Next Step
[Queries](queries.md) or [Mutations](mutations.md)


## Subscriptions
### Load Library
#### Option 1: Import
From the command line install [subscriptions-transport-ws](https://github.com/apollographql/subscriptions-transport-ws):
```sh
npm install --S subscriptions-transport-ws
```

Load into the client
```javascript
import { SubscriptionClient, addGraphQLSubscriptions } from 'subscriptions-transport-ws';
```

#### Option 2: Bundle
For [subscription-transport-ws](https://github.com/apollographql/subscriptions-transport-ws) load the bundle:
```html
<script type="text/javascript" src="bower_components/knockout-apollo/dist/subscription-transport-ws.umd.bundle.min.js"></script>
```
The `subscription-transport-ws.umd.bundle.min.js` file exposes `SubscriptionClient` and `addGraphQLSubscriptions`.

### Create an Apollo Client that includes GraphQL Subscriptions
In the client:
```javascript
var wsClient = new SubscriptionClient("ws://localhost:3000/subscriptions", {
    reconnect: true
});

// Create an Apollo Client
var networkInterface = createNetworkInterface({ uri: "http://localhost:3000/graphql"});

// Extend the network interface with the WebSocket
var networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
    networkInterface,
    wsClient
);

var apolloClient = new ApolloClient({
    networkInterface: networkInterfaceWithSubscriptions
});
```

## Next Step
[Subscriptions](subscriptions.md)



