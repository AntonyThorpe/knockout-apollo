/**
 * viewModel
 * @link https://www.apollographql.com/docs/react/advanced/subscriptions.html#subscriptions-client
 * @type function
 */
import { ApolloClient } from 'apollo-client';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { getMainDefinition } from 'apollo-utilities';
import gql from 'graphql-tag';

// Establish a GraphQL connection
const link = split(
    // split based on operation type
    ({ query }) => {
      const { kind, operation } = getMainDefinition(query);
      return kind === 'OperationDefinition' && operation === 'subscription';
    },
  new WebSocketLink({
    uri: 'ws://localhost:4000/graphql',
    options: {
      reconnect: true
    }
  }),
  new HttpLink(
	  { uri: 'http://localhost:4000/graphql' }
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
                self.todoList4.insert(data.data.todoList);
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


    // Fourth example - Optimistic updates
    self.todoList4 = ko.observableArray().crud({
        constructor: TodoList,
        uniqueIdentifier: "_id"
    }).launchApollo(apolloClient);

    self.todoList4.messages = ko.observableArray();
    self.todoList4.loading = true;

    self.addTask4 = function() {
        self.todoList4.itemForAdding(new TodoList({}));
    };

    self.saveAdd4 = function(v) {
        let item = self.todoList4.insert(ko.toJS(v));
        self.todoList4.itemForAdding(null);

        // contact server
        self.todoList4.apollo({
            mutation: createTodoMutation,
            variables: {
                task: item.task.peek(),
                completed: item.completed.peek()
            },
            // optimistic part
            optimisticResponse: function(data){
                data = Object.assign({_id: Math.round(Math.random() * -1000000)}, data);
                data.__typename = 'TodoList';
                return {
                    createTodo: {
                        _id: data._id,
                        todoList: data,
                        __typename: 'TodoList'
                    }
                };
            },
            update: function(cache, {data: {createTodo}}) {
                // Read the data from our cache for this query.
                const data = cache.readQuery({ query: getTodoListQuery });

                if (createTodo._id < 0) {
                    // Optimistic data goes into cache
                    data.todoList.push(createTodo.todoList);
                } else {
                    // _id returned from server so push again
                    data.todoList.push(
                        {
                            _id: createTodo._id,
                            task: item.task.peek(),
                            completed: item.completed.peek(),
                            __typename: createTodo.__typename
                        }
                    );

                    item._id(createTodo._id);  // update _id in knockout
                }

                // Write our data back to the cache.
                cache.writeQuery({ query: getTodoListQuery, data });
            }
            // close optimistic update
        },
        {
            resolve: function(data) {
                self.todoList4.messages.push({title: "Added"}, {content: ko.toJSON(data.data.createTodo) });
            }
        });

    };

    self.cancelAdd4 = function() {
        self.todoList4.itemForAdding(null);
    };

    self.deleteItem4 = function(item) {
        let index = self.todoList4.indexOf(item);
        self.todoList4.remove(item);

        // contact server
        self.todoList4.apollo({
            mutation: removeTodoMutation,
            variables: {
                _id: item._id.peek()
            },
            // optimistic part
            optimisticResponse: function(data){
                data.__typename = 'TodoList';
                return {
                    removeTodo: {
                        _id: data._id,
                        todoList: data,
                        __typename: 'TodoList'
                    }
                };
            },
            update: function(cache, {data: {removeTodo}}) {
                // Read the data from our cache for this query.
                const data = cache.readQuery({ query: getTodoListQuery });

                // remove from store
                ko.utils.arrayRemoveItem(
                    data.todoList,
                    ko.utils.arrayFirst(data.todoList, function(obj){
                        return obj._id === removeTodo._id;
                    })
                );

                // Write our data back to the cache.
                cache.writeQuery({ query: getTodoListQuery, data });
            }
            // close optimistic update
        },
        {
            resolve: function(data){
                self.todoList4.messages.push({title: "Deleted"}, {content: ko.toJSON(data.data.removeTodo) });
            },
            reject: function(error) {
                self.todoList4.apollo.failMessage("Hey, that didnt work " + error);
                alert("hey, that didnt work. Error: " + error + ".  Will need to revert to previous state");

                self.todoList4.splice(index, 0, item);
            }
        });
    };

    /**
     * Provide a clean object for saving
     * @param  {object} item object with update function
     * @return {object} return object
     */
    let cleanItem = function(item) {
        item = ko.toJS(item);
        delete item.update; // remove method
        return item;
    };

    self.acceptEditItem4 = function(item) {
        let selected = self.todoList4.selectedItem(); // obtain "this"
        let originalItem = ko.toJS(self.todoList4.selectedItem.peek());

        //apply updates from the edited item to the selected item
        selected.update(cleanItem(item));

        //clear editing values
        self.todoList4.selectedItem(null);
        self.todoList4.itemForEditing(null);

        // Communicate with server
        self.todoList4.apollo({
            mutation: updateTodoMutation,
            variables: {
                _id: item._id.peek(),
                task: item.task.peek(),
                completed: item.completed.peek()
            },
            // optimistic part
            optimisticResponse: function(data){
                data.__typename = 'TodoList';
                return {
                    updateTodo: {
                        _id: data._id,
                        task: data.task,
                        completed: data.completed,
                        __typename: 'TodoList'
                    }
                };
            }
            // close optimistic update (no need for update as is automatic)
        },
        {
            resolve: function(data) {
                if (data.data.updateTodo) {
                    self.todoList4.messages.push({title: "Updated ", content: ko.toJSON(data.data.updateTodo)});
                }

            },
            reject: function(error) {
                self.todoList4.apollo.failMessage("Hey, that didnt work " + error);
                alert("hey, that didnt work. Error: " + error + ".  Will need to revert to previous state");

                selected.update(cleanItem(originalItem));
            }
        });
    };




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
