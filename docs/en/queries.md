# Queries

## Getting Started in Knockout
```javascript
// Initialise via a Custom Function
var self = this;
self.yourObservable = ko.observable().launchApollo(apolloClient, defaultErrorCallback);

// Now we are ready to make a query
self.yourObservable.apollo({object for Apollo}, {object of callbacks});
```

## Query with Parameters
On the server add the corresponding schema and resolver:
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
And, in the client:
```javascript
// Create the GraphQL document
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
The `defaultErrorCallback` is to console log the error.  To customise, provide a callback function as a second arguement to the `launchApollo` function when initialising (or the third option is that you can simply pass it in with the call).  Note that `ko.plus` provides a `failMessage` observable that can be set within the error callback.

## Index
[Link](index.md)
