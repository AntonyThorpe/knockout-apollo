# knockout-apollo
A knockoutjs extension to connect to a GraphQL endpoint through an ApolloClient instance

## Approach
* A thin wrapper around an instance of the ApolloClient class for GraphQL queries, mutations and subscriptions 
* Utilises the structure and loading features of [ko.plus](http://stevegreatrex.github.io/ko.plus/) for queries and mutations

## How it works
Attaches additional methods to Observables/Observable Arrays via a [Custom Function](http://knockoutjs.com/documentation/fn.html).  This library is strongly influenced by [Vue-Apollo](https://github.com/Akryum/vue-apollo).

## Requirements
* [Apollo Client](https://github.com/apollostack/apollo-client)
* [GraphQL Tag](https://github.com/apollostack/graphql-tag)
* [Knockout](http://knockoutjs.com)
* [ko.plus](http://stevegreatrex.github.io/ko.plus/)
* [jQuery](http://jquery.com)

## Documentation
[Index](/docs/en/index.md)

## Demos
1) To run a demo in localhost open a terminal and: 
* `git clone https://github.com/AntonyThorpe/knockout-apollo.git`.  
* And `cd knockout-apollo` and type `npm install --save-dev`.
* Next `cd tests` and `meteor npm install -S`.  Then after meteor and associated libraries have been installed `cd ..` back to the project root.
* Then `npm run test` (we use Meteor Tests as a server for the demo)
* Once Meteor is up and running, open another terminal and cd to the project root and then `npm run demo`.

2) (Doesn't currently work - need a new endpoint that works) Find out info about the Pokémon from https://graphql-pokemon.now.sh/ endpoint at [http://antonythorpe.github.io/knockout-apollo](http://antonythorpe.github.io/knockout-apollo)

## Example: Learn Apollo
Under the `learn_apollo_example` folder, is code modified from [Learn Apollo](https://www.learnapollo.com).  If you want to get this up and running:
* start the `Learn Apollo` React tutorial until you get past the Getting Started section.  Note down the Apollo Client configuration.  You will need this for line 5 of `index.js`.
* cd to exercise 6 and `npm install`
* copy `index.html` and `index.js` from the example folder and replace the code in exercise 6
* replace the `client` variable with the configuration noted above from `Learn Apollo`.
* add your name as the trainer in `index.js` (line 273)
* then `npm install --save graphql-tag knockout knockout-apollo ko.plus jquery knockoutcrud`
* To launch a browser `npm start`
Hope this works :)

## Tests
In the terminal cd to the `test` folder and `meteor test --driver-package=practicalmeteor:mocha --port 3002`.  Or `npm run test`.  No tests just yet.

## Updating the Bundles
* At the project root `npm install -D`.
* Then `npm run build`

## Todo
* write tests

## Contributions
Pull requests are most welcome!

## Support
None sorry.

## Change Log
[File](changelog.md)

## Licence
[MIT](LICENCE)

## Links
[The Anatomy of a GraphQL Query](https://dev-blog.apollodata.com/the-anatomy-of-a-graphql-query-6dffa9e9e747) - Apollo Blog by Sashko Stubailo.  The code follows these definitions.
[Apollo-Vue](https://github.com/Akryum/vue-apollo) - contains good non-React examples
[Meteor-Ticker](https://github.com/quintstoffers/meteornl-ticker) - Apollo+Meteor app showcasing GraphQL subscriptions in its simplest form
[GraphQL-APIs](https://github.com/APIs-guru/graphql-apis) - A collective list of public GraphQL APIs
