# knockout-apollo
A knockoutjs extension to connect to a GraphQL endpoint through an ApolloClient instance

## Approach
* Provide public access to the an instance of the ApolloClient class, as well as, ObservableQuery for the watchQuery/subscribe methods (not fully implemented yet)
* Utilise the structure and loading features of [ko.plus](http://stevegreatrex.github.io/ko.plus/)

## How it works
Attaches additional methods to Observables/Observable Arrays via a [Custom Function](http://knockoutjs.com/documentation/fn.html).

## Requirements
* [Apollo Client](https://github.com/apollostack/apollo-client)
* [GraphQL Tag](https://github.com/apollostack/graphql-tag)
* [Knockout](http://knockoutjs.com)
* [ko.plus](http://stevegreatrex.github.io/ko.plus/)
* [jQuery](http://jquery.com)

## Installation
In the command line:
```sh
npm install --save apollo-client graphql-tag knockout knockout-apollo ko.plus jquery
```

## Getting Started
```js
// set the JavaScript template literal tag that parses GraphQL query strings into the standard GraphQL AST
import gql from 'graphql-tag';

// Create an ApolloClient
var apolloClient = new ApolloClient({
      networkInterface: createNetworkInterface({ uri: https://yourwebsite.net/graphql})
});

// Next initialise via a Custom Function
this.yourObservable = ko.observable().launchApollo(apolloClient, errorCallback);

// Now we are ready to make queries etc with Apollo.  Outline below:
this.yourObservable.apollo({object for Apollo}, {object of callbacks});
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

this.yourObservable.apollo(
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
        },
        // callback to report errors (optional)
        reject: function(error) {
            console.log(error);
        },
        always: function(){
            // called for both success and failure (optional)
        }
    }
);
```

## Templates
Thanks to the `ko.plus` knockout plugin there are a couple of useful public observables.  A loading indicator can be used through `yourObservable.apollo.isRunning` and if failed through `yourObservable.apollo.failed`.  See [link](https://github.com/stevegreatrex/ko.plus/blob/master/README.md#example-implementation).

## Error Callback
The default is to console log the error.  For an alternative, provide a callback function as a second arguement to the `launchApollo` function when initialising (or you can simply pass it in with the call).

## Example
Under the example folder, is code modified from [Learn Apollo](https://www.learnapollo.com).  If you want to get this up and running:
* start the `Learn Apollo` React tutorial until you get past the Getting Started section.  Note down the Apollo Client configuration.  You will need this for line 5 of `index.js`.
* cd to exercise 6 and `npm install`
* copy `index.html` and `index.js` from the example folder and replace the code in exercise 6
* replace the `client` variable with the configuration noted above from `Learn Apollo`.
* then `npm install --save graphql-tag knockout knockout-apollo ko.plus jquery knockoutcrud`
* To launch a browser `npm start`
Hope this works :)

## Todo
* build Apollo for the browser
* watchQuery
* subscriptions
* tests

## Support
None sorry.

## Change Log
[File](changelog.md)

## Licence
[MIT](LICENCE)
