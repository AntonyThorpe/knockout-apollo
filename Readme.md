# knockout-apollo
A knockoutjs extension to connect to a GraphQL endpoint through an ApolloClient instance

## Approach
* Provide public access to the an instance of the ApolloClient class, as well as, ObservableQuery for the query, subscribe, etc., methods (subscriptions not fully implemented yet)
* Utilise the structure and loading features of [ko.plus](http://stevegreatrex.github.io/ko.plus/)

## How it works
Attaches additional methods to Observables/Observable Arrays via a [Custom Function](http://knockoutjs.com/documentation/fn.html).

## Requirements
* [Apollo Client](https://github.com/apollostack/apollo-client)
* [GraphQL Tag](https://github.com/apollostack/graphql-tag)
* [Knockout](http://knockoutjs.com)
* [ko.plus](http://stevegreatrex.github.io/ko.plus/)
* [jQuery](http://jquery.com)

## Demo
Find out info about the Pokemon from https://graphql-pokemon.now.sh/ endpoint at [http://antonythorpe.github.io/knockout-apollo](http://antonythorpe.github.io/knockout-apollo)

## Installation
### Option 1
From the command line:
```sh
npm install --save apollo-client graphql-tag knockout knockout-apollo ko.plus jquery
```
###Option 2
A little less flexible way is to install the above dependencies using bower and add as script tags to your html.  From the command line:
```sh
bower install --save knockout ko.plus jquery https://github.com/AntonyThorpe/knockout-apollo.git
```
Example below:
```html
<script type="text/javascript" src="bower_components/jquery/dist/jquery.min.js"></script>
<script type="text/javascript" src="bower_components/knockout/dist/knockout.js"></script>
<script type="text/javascript" src="bower_components/ko.plus/dist/ko.plus.min.js"></script>
<script type="text/javascript" src="bower_components/knockout-apollo/knockout-apollo.js"></script>
<script type="text/javascript" src="bower_components/knockout-apollo/dist/umd.bundle.js"></script>
```
The `umd.bundle.js` exposes `ApolloClient`, `createNetworkInterface` (of the Apollo Client library) and `gql` (from GraphQL Tag).

## Getting Started
```js
// set the JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST
import ApolloClient, {
	createNetworkInterface
} from 'apollo-client';
import gql from 'graphql-tag';
global.jQuery = require('jquery');
import ko from 'knockout';
require('ko.plus');
import 'knockout-apollo.js';

// Create an ApolloClient
const apolloClient = new ApolloClient({
      networkInterface: createNetworkInterface({ uri: https://yourwebsite.net/graphql})
});

// Next initialise via a Custom Function
var self = this;
self.yourObservable = ko.observable().launchApollo(apolloClient, errorCallback);

// Now we are ready to make queries etc with Apollo.  Outline below:
self.yourObservable.apollo({object for Apollo}, {object of callbacks});
```

## Query with Parameters
Server-side, add the corresponding schema and resolver:
```javascript
export const schema = `
type Query {
  ping(message: String!): String
}
schema {
  query: Query
}
`;

export const resolvers = {
  Query: {
    ping(root, { message }, context) {
      return `Answering ${message}`;
    },
  },
};
```
And, client-side:
```javascript
var query = gql`query PingMessage($message: String!) {
    ping(message: $message)
}`;

self.yourObservable.apollo(
    {
        query: query,
        variables: {
            message: 'Meow'
        }
    },
    {
        // callback when successful
        resolve: function(data) {
            console.log(data); //An ApolloQueryResult
            self.observableToUpdate(data.data.PingMessage);
        },
        // callback to report errors (optional)
        reject: function(error) {
            self.yourObservable.failMessage("Hey, that didnt work " + error);
        },
        // called for both success and failure (optional)
        always: function(){
            ...
        }
    }
);
```

## Templates
Thanks to the `ko.plus` knockout plugin there are a couple of useful public observables.  A loading indicator can be used through `yourObservable.apollo.isRunning` and if failed through `yourObservable.apollo.failed`.  See [link](https://github.com/stevegreatrex/ko.plus/blob/master/README.md#example-implementation).

## Error Callback
The default `errorCallback` is to console log the error.  For an alternative, provide a callback function as a second arguement to the `launchApollo` function when initialising (or the third option is that you can simply pass it in with the call).  Note that `ko.plus` provides a `failMessage` observable that can be set within the error callback.

## Example
Under the example folder, is code modified from [Learn Apollo](https://www.learnapollo.com).  If you want to get this up and running:
* start the `Learn Apollo` React tutorial until you get past the Getting Started section.  Note down the Apollo Client configuration.  You will need this for line 5 of `index.js`.
* cd to exercise 6 and `npm install`
* copy `index.html` and `index.js` from the example folder and replace the code in exercise 6
* replace the `client` variable with the configuration noted above from `Learn Apollo`.
* add your name as the trainer in `index.js` (line 273)
* then `npm install --save graphql-tag knockout knockout-apollo ko.plus jquery knockoutcrud`
* To launch a browser `npm start`
Hope this works :)

## Contributions
Pull requests most welcome!

## Todo
* subscriptions
* tests

## Support
None sorry.

## Change Log
[File](changelog.md)

## Licence
[MIT](LICENCE)
