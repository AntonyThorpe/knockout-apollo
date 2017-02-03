import ApolloClient, { createNetworkInterface } from 'apollo-client'
import 'tachyons'
import './index.css'

const client = new ApolloClient({
  networkInterface: createNetworkInterface(
      { uri: 'Enter your GraphQL endpoint here'}
  ),
  dataIdFromObject: o => o.id
});

// Knockout plugins
import ko from 'knockout';
global.jQuery = require('jquery');
ko.plus = require("ko.plus");
import 'knockoutcrud';
import gql from 'graphql-tag';
import 'knockout-apollo';


var PokemonCard = function(data) {
    data = data || {}; // not null check
    this.id = ko.observable();
    this.name = ko.observable();
    this.url = ko.observable();
    this.update(data);
}
ko.utils.extend(PokemonCard.prototype, {
    update: function(data) {
        this.id(data.id);
        this.name(data.name);
        this.url(data.url);
    }
});

var Trainer = function(data) {
    data = data || {}; // not null check
    this.id = ko.observable();
    this.name = ko.observable();
    this.ownedPokemons = ko.observableArray().crud({
        constructor: PokemonCard,
        uniqueIdentifier: "id"
    }).launchApollo(client);
    this.update(data);
}
ko.utils.extend(Trainer.prototype, {
    update: function(data) {
        this.id(data.id);
        this.name(data.name);

        var tempArray = ko.utils.arrayMap(data.ownedPokemons, function(item) {
			return new PokemonCard(item);
		});
		this.ownedPokemons.push.apply(this.ownedPokemons, tempArray);
    }
});

ko.components.register("pokemon-preview", {
    template:
        `<a data-bind="attr: {href: '/view/' + id()}, click: selectItem" class="link dim grow mw4 bg-white ma2 pa3 shadow-1" style="min-width: 200px">
          <img data-bind="attr:{ src: url, alt: name}" />
          <div data-bind="text: name" class="gray tc"></div>
        </a>`
});

ko.components.register("card", {
    template: `
        <input data-bind="textInput: name, attr:{placeholder: name}, hasFocus: true" class="w-100 pa3 mv2"/>
        <input data-bind="textInput: url, attr:{placeholder: 'Image url'}" class="w-100 pa3 mv2"/>
        <img data-bind="attr:{src: url()}" style="width: 100px" class="w-100 mv3" role="presentation"/>
    `
});

ko.components.register("edit-pokemon-card", {
    viewModel: function(params){
        var self = this;
        this.id = params.id;
        this.name = params.name;
        this.url = params.url;
        this.trainerId = params.trainerId;
        self.acceptItem = params.acceptItem;
        this.revertItem = params.revertItem;
        this.removeItem = params.removeItem;
        this.apollo = params.apollo;

        this.handleSave = function(item){
            const updatePokemon = gql`
              mutation updatePokemon($id: ID!, $name: String!, $url: String!) {
                updatePokemon(id: $id, name: $name, url: $url) {
                  id
                  name
                  url
                }
              }
            `;
            this.apollo({
                mutation: updatePokemon,
                variables: {
                    id: item.id(),
                    name: item.name(),
                    url: item.url()
                }
            },{
                resolve: function(data) {
                    this.acceptItem(data.data.updatePokemon);
                }
            })
        };

        this.handleRemove = function(item) {
            const deletePokemon = gql`
              mutation deletePokemon($id: ID!) {
                deletePokemon(id: $id) {
                  id
                }
              }
            `;
            this.apollo({
                mutation: deletePokemon,
                variables: {
                    id: item.id()
                }
            },
            {
                resolve: function(data) {
                    this.removeItem(data.data.deletePokemon);
                }
            });
        };

        self.canSave = ko.pureComputed(function(){
            return this.name() && this.url();
        }, self);
    },
    template: `
    <div class="w-100 pa4 flex justify-center">
        <card params="name: name, url: url"></card>
        <div class="flex justify-between">
            <!-- ko ifnot: apollo.isRunning -->
                <button data-bind="click: revertItem">Cancel</Button>
                <button data-bind="enable: canSave, click: handleSave">Save</button>
                <button data-bind="click: handleRemove">Delete</button>
            <!-- /ko -->
            <h2 data-bind="visible: apollo.isRunning">Communicating with Server</h2>
        </div>
    </div>
    `
});

ko.components.register("add-pokemon-preview", {
    viewModel: function(params) {
        this.ownedPokemons = params.ownedPokemons;
        this.preparePokemonAdd = function(data){
            this.ownedPokemons.itemForAdding(new PokemonCard({}));
        }
    },
    template:
        `<style>add-pokemon-preview { minWidth: 200px }</style>
        <a data-bind="click: preparePokemonAdd" class="link dim mw4 ma2 ba b--dashed bw3 b--silver flex justify-center items-center">
            <div class="silver tc v-mid fw4 f1">+</div>
        </a>`
});

ko.components.register("add-pokemon-card", {
    viewModel: function(params){
        var self = this;
        self.name = params.name;
        self.url = params.url;
        self.trainerId = params.trainerId;
        self.ownedPokemons = params.ownedPokemons;

        self.handleCancel = function(){
            self.ownedPokemons.itemForAdding(null);
        };

        self.handleSave = function(data) {
            var createPokemonMutation = gql`
              mutation createPokemon($name: String!, $url: String!, $trainerId: ID) {
                createPokemon(name: $name, url: $url, trainerId: $trainerId) {
                  id
                  name
                  url
                }
              }
            `;
            self.ownedPokemons.apollo({
                mutation: createPokemonMutation,
                variables: {
                    name: data.name.peek(),
                    url: data.url.peek(),
                    trainerId: this.trainerId.peek()
                }
            },
            {
                resolve: function(data){
                    self.ownedPokemons.insert(data.data.createPokemon);
                    self.ownedPokemons.itemForAdding(null);
                }
            });
        }

        self.canSave = ko.pureComputed(function(){
            return self.name() && self.url();
        }, self);

    },
    template: `
        <div class="w-100 pa4 flex justify-center">
            <card params="name: name, url: url" style="max-width: 400px"></card>
            <div class="flex justify-between">
                <!-- ko ifnot: ownedPokemons.apollo.isRunning -->
                    <button data-bind="click: handleCancel">Cancel</Button>
                    <button data-bind="enable: canSave, click: handleSave">Save</button>
                <!-- /ko -->
                <h2 data-bind="visible: ownedPokemons.apollo.isRunning">Saving</h2>
            </div>
        </div>
    `
});

ko.components.register("pokedex", {
    viewModel: function(params){
        this.trainers = params.trainers;
    },
    template: `
        <div data-bind="foreach: trainers" class="tc pa5 cVMGvB">Hey <span data-bind="text: name"></span> there are <span data-bind="text: ownedPokemons().length"></span> Pokemons in your pokedex
        </div>

        <div data-bind="foreach: trainers">
            <!-- ko ifnot:ownedPokemons.itemForAdding() || ownedPokemons.itemForEditing() -->
                <add-pokemon-preview params="ownedPokemons: ownedPokemons"></add-pokemon-preview>
                <div data-bind="foreach: ownedPokemons" style="display: flex; flex-direction: row; flex-wrap: nowrap">
                    <pokemon-preview params="id: id, name: name, url: url, update: update, selectItem: $parent.ownedPokemons.selectItem" class="flex flex-wrap justify-center center w-75"></pokemon-preview>
                </div>
            <!-- /ko -->
            <div data-bind="with: ownedPokemons.itemForAdding">
                <add-pokemon-card params="name: name, url: url, ownedPokemons: $parent.ownedPokemons, trainerId: $parent.id"></add-pokemon-card>
                <h3>Pokemon Links</h3>
                <p>http://assets.pokemon.com/assets/cms2/img/pokedex/full//001.png</p>
                <p>http://assets.pokemon.com/assets/cms2/img/pokedex/full//002.png</p>
                <p>http://assets.pokemon.com/assets/cms2/img/pokedex/full//003.png</p>
                <p>etc</p>
            </div>
            <div data-bind="with: ownedPokemons.itemForEditing">
                <edit-pokemon-card params="id: id, name: name, url: url, trainerId: $parent.id, acceptItem: $parent.ownedPokemons.acceptItem, revertItem: $parent.ownedPokemons.revertItem, removeItem: $parent.ownedPokemons.removeItem, apollo: $parent.ownedPokemons.apollo"></edit-pokemon-card>
            </div>
        </div>
    `
});

const TrainerQuery = gql`query TrainerQuery($name: String!) {
  Trainer(name: $name) {
    id
    name
    ownedPokemons {
      id
      name
      url
    }
  }
}`;

var ViewModel = function(){
    var self = this;

    self.trainers = ko.observableArray().crud({
        constructor: Trainer,
        uniqueIdentifier: "id"
    }).launchApollo(client);

    // Load data and insert into knockout
    self.trainers.apollo({
        query: TrainerQuery,
        variables: {
            name: "Antony Thorpe"
        }
    }, {
        resolve: function(data){
            self.trainers.insert(data.data.Trainer);
        }
    });
};

ko.applyBindings(new ViewModel(), document.getElementById('knockout'));
