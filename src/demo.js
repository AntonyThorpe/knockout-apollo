import ApolloClient, {
	createNetworkInterface
} from 'apollo-client';

import gql from 'graphql-tag';

global.jQuery = require('jquery');
import ko from 'knockout';
require('ko.plus');
import '../knockout-apollo.js';

var client = new ApolloClient({
	networkInterface: createNetworkInterface({
		uri: "https://graphql-pokemon.now.sh/"
	})
});

const query = gql`query pokemon($name: String!) {
	pokemon(name: $name) {
      id
      number
      name
      attacks {
        special {
          name
          type
          damage
        }
      }
      evolutions {
        id
        number
        name
        weight {
          minimum
          maximum
        }
        attacks {
          fast {
            name
            type
            damage
          }
        }
      }
    }
}`;


function Pokemons() {
	var self = this;
	self.pokemon = ko.observable("Pikachu").launchApollo(client);
	self.result = ko.observable();
	self.getPokemon = function() {
		self.result(null);
		self.pokemon.apollo({
			query: query,
			variables: {
				name: self.pokemon()
			}
		}, {
			resolve: function(data) {
				self.result(ko.toJSON(data.data.pokemon, null, 2));
			}
		});
	};
};

ko.applyBindings(new Pokemons(), document.getElementById('demo'));
