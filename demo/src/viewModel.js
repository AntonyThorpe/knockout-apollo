/**
 * viewModel
 * @link https://www.apollographql.com/docs/react/features/subscriptions.html
 * @type function
 */
import { ApolloClient } from 'apollo-client';
import { ApolloLink } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getOperationAST } from 'graphql';
import gql from 'graphql-tag';

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

const cache = new InMemoryCache({
    dataIdFromObject: object => object._id
});

const apolloClient = new ApolloClient({
  link,
  cache
});


/**
 * viewModel
 * @constructor
 */
function TodoViewModel() {
	// GraphQL Queries and Mutations
	var getTodoListQuery = gql`query {
						  todoList {
						    _id
						    task
						    completed
						  }
						}`;
	var removeTodoMutation = gql`mutation removeTodo($_id: ID!) {
					    removeTodo(_id: $_id) {
					        _id
					    }
					}`;
	var createTodoMutation = gql`
		mutation ($task: String!, $completed: Boolean!) {
		  createTodo(task: $task, completed: $completed) {
		    _id
		  }
		}`;
	var updateTodoMutation = gql`
		mutation ($_id: ID!, $task: String!, $completed: Boolean!) {
			updateTodo(_id: $_id, task: $task, completed: $completed) {
			  _id
			  task
			  completed
			}
		}`;
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

	var self = this;
	var data;

	self.todoList = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	}).launchApollo(apolloClient);
	self.todoList.messages = ko.observableArray();

	self.todoList.apollo(
	    {
	        query: getTodoListQuery
	    },
	    {
	        // callback when successful
	        resolve: function(data) {
	        	//initialise with a few Todos because we are very busy people
	        	self.todoList.insert(data.data.todoList);
	        	self.todoList2.insert(data.data.todoList);
	        	self.todoList3.insert(data.data.todoList);
	        },
	        // callback to report errors (optional)
	        reject: function(error) {
	            self.call.failMessage("Hey, that didnt work " + error);
	        }
	    }
	);

	self.prepareCollectionEdit = function(data) {
		self.todoList.beforeEdit(ko.toJS(self.todoList()));
		self.todoList.messages([]);
	};

	self.addTask = function() {
		var toSave = {};
		// save new items
		var newInstance = self.todoList.insert(toSave);
		self.todoList.justAdded.push(newInstance);

		var index = self.todoList.indexOf(newInstance);
		self.todoList()[index]._id.isSelected(true);
	};

	self.save = function() {
		/*** Save to server ***/

		// Remove Deleted
		if (self.todoList.justRemoved().length) {
			ko.utils.arrayForEach(self.todoList.justRemoved(), function(item){
				self.todoList.apollo({
					mutation: removeTodoMutation,
					variables: {
						_id: item._id()
					}
				},
				{
					resolve: function(data){
						self.todoList.messages.push({title: "Deleted"}, {content: ko.toJSON(data.data.removeTodo) });
					}
				});
			});
		}

		// Add new tasks
		if (self.todoList.justAdded().length) {
			ko.utils.arrayForEach(self.todoList.justAdded(), function(item){
				self.todoList.apollo({
					mutation: createTodoMutation,
					variables: {
						task: item.task(),
						completed: item.completed()
					}
				},
				{
					resolve: function(data) {
						self.todoList.messages.push({title: "Added"}, {content: ko.toJSON(data.data.createTodo) });
						item._id(data.data.createTodo._id);  // update _id

					}
				});
			});
		}

		var changed = self.todoList.justUpdated();
		if (changed) {
			ko.utils.arrayForEach(changed, function(item){
				self.todoList.apollo({
					mutation: updateTodoMutation,
					variables: {
						_id: item.value._id,
						task: item.value.task,
						completed: item.value.completed
					}
				},
				{
					resolve: function(data) {
						if (data.data.updateTodo) {
							self.todoList.messages.push({title: "Updated ", content: ko.toJSON(data.data.updateTodo)});
						}

					}
				});
			});
		}

		// Knockout
		self.todoList.justRemoved.removeAll(); // empty the parked removed
		self.todoList.justAdded.removeAll(); // empty the parked adds
		self.todoList.beforeEdit(null);
	};

	self.cancel = function() {
		// return model to cache version
		self.todoList.cancelEdit();
		self.todoList.beforeEdit(null);
	};

	self.editItem = function(item) {
		item._id.isSelected(true);
		self.todoList.selectItem(item);
	};

	// Second example
	self.todoList2 = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	}).launchApollo(apolloClient);
	self.todoList2.messages = ko.observableArray();
	self.todoList2.loading = true;

	self.addTask2 = function() {
		self.todoList2.itemForAdding(new TodoList({}));
	};

	self.saveAdd = function(data) {
		self.todoList2.insert(ko.toJS(data));
		self.todoList2.itemForAdding(null);
	};

	self.cancelAdd = function() {
		self.todoList2.itemForAdding(null);
	};

	self.todoList2.subscribe(function(v){
		if (self.todoList2.loading) {
			self.todoList2.loading = false;
		} else {
			ko.utils.arrayForEach(v, function(item){
                switch (item.status) {
					case "added":
						self.todoList2.apollo({
							mutation: createTodoMutation,
							variables: {
								task: item.value.task.peek(),
								completed: item.value.completed.peek()
							}
						},
						{
							resolve: function(data) {
								self.todoList2.messages.push({title: "Added"}, {content: ko.toJSON(data.data.createTodo) });
								item.value._id(data.data.createTodo._id);  // update _id
							}
						});
						break;
					case "deleted":
						self.todoList2.apollo({
							mutation: removeTodoMutation,
							variables: {
								_id: item.value._id.peek()
							}
						},
						{
							resolve: function(data){
								self.todoList2.messages.push({title: "Deleted"}, {content: ko.toJSON(data.data.removeTodo) });
							}
						});
						break;
					case "updated":
						self.todoList2.apollo({
							mutation: updateTodoMutation,
							variables: {
								_id: item.value._id.peek(),
								task: item.value.task.peek(),
								completed: item.value.completed.peek()
							}
						},
						{
							resolve: function(data) {
								if (data.data.updateTodo) {
									self.todoList2.messages.push({title: "Updated ", content: ko.toJSON(data.data.updateTodo)});
								}

							}
						});
						break;
				}
			});
		}
	}, null, "arrayChange");


	// Third example - watch via a Subscription to the Server
	self.todoList3 = ko.observableArray().crud({
		constructor: TodoList,
		uniqueIdentifier: "_id"
	}).liftOffSubscription(apolloClient);

	self.todoList3.startGraphqlSubscription(
		{
			query: graphqlDocumentTodoList,
		},
		{
			next: function(data) {
				switch (data.data.todoList.status) {
    	        	case "added":
    	        		self.todoList3.insert(data.data.todoList.value);
    	        		break;
    	        	case "updated":
    	        		self.todoList3.upsert(data.data.todoList.value);
    	        		break;
    	        	case "deleted":
    	        		var _id = data.data.todoList.value._id;
    	        		var exists = ko.utils.arrayFirst(self.todoList3.peek(), function(item) {
    						return ko.unwrap(item._id) === _id;
    					});
    					if (exists) {
    	        			self.todoList3.remove(exists);
    					}
    	        		break;
    	        }
			}
		}
	);

	//  Vanilla subscription
/*	apolloClient.subscribe({
	    query: graphqlDocumentTodoList
	}).subscribe({
	    next (data) {
	        // Notify your application with the new arrived data
            console.log("got to Vanilla subscription");
            console.log(data);
	    }
	}); */
};

document.addEventListener("DOMContentLoaded", function(event) {
    ko.applyBindings(new TodoViewModel());
});
