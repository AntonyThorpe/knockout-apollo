# knockout-apollo
A knockoutjs extension to connect to a GraphQL endpoint through an ApolloClient instance

## Approach
* A thin wrapper around an instance of the ApolloClient class for GraphQL queries, mutations and subscriptions
* Utilises the structure and loading features of [ko.plus](http://stevegreatrex.github.io/ko.plus/) for queries and mutations

## How it works
Attaches additional methods to Observables/Observable Arrays via a [Custom Function](http://knockoutjs.com/documentation/fn.html).  This library is strongly influenced by [Vue-Apollo v1](https://github.com/Akryum/vue-apollo).

## Requirements
* [Apollo Client](https://github.com/apollographql/apollo-client)
* [GraphQL Tag](https://github.com/apollographql/graphql-tag)
* [Knockout](http://knockoutjs.com)
* [ko.plus](http://stevegreatrex.github.io/ko.plus/)
* [jQuery](http://jquery.com)

## Documentation
[Index](/docs/en/index.md)

## Demo
To run a demo in localhost open a terminal and:
* `git clone https://github.com/AntonyThorpe/knockout-apollo.git`.
* And `cd knockout-apollo` and type `npm install`.
* Then `npm run test` (we use Meteor Tests as a server for the demo)
* To update any of the demo files open a new terminal and `npm run watch` to save changes to `dist/demo.js`.
* Once Meteor is up and running open a third terminal, cd to the project root and `npm run demo` to open in Firefox.

## Tests
In the terminal cd to the `tests` folder and `meteor test --driver-package=practicalmeteor:mocha --port 3002`.  Or, from project root, `npm run tests`.

## Creating a knockout-apollo min bundle
* Then `npm run build`

## Contributions
Pull requests are most welcome!

## Support
None sorry.

## Change Log
[File](changelog.md)

## Licence
[MIT](LICENCE)

## Links
* [The Anatomy of a GraphQL Query](https://dev-blog.apollodata.com/the-anatomy-of-a-graphql-query-6dffa9e9e747) - Apollo Blog by Sashko Stubailo.  The code follows these definitions.
* [Apollo-Vue](https://github.com/Akryum/vue-apollo) - contains good non-React examples
* [Meteor-Ticker](https://github.com/quintstoffers/meteornl-ticker) - Apollo+Meteor app showcasing GraphQL subscriptions in its simplest form
