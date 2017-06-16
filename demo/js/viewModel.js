function TodoViewModel() {
	// Setup Subscription
	var wsClient = new SubscriptionClient("ws://localhost:3000/subscriptions", {
	    reconnect: true
	});


	// Create an Apollo Client
	var networkInterface = createNetworkInterface({ uri: "http://localhost:3000/graphql"});
	networkInterface.use([{
	    applyMiddleware(req, next) {
	      setTimeout(next, 500);   // create fake 500 ms of latency to every request
	    }
	}]);

	// Extend the network interface with the WebSocket
	var networkInterfaceWithSubscriptions = addGraphQLSubscriptions(
	    networkInterface,
	    wsClient
	);

	var apolloClient = new ApolloClient({
	    networkInterface: networkInterfaceWithSubscriptions,
	    connectToDevTools: true
	});

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

/*  Vanilla subscription
	var observable = apolloClient.subscribe({
	    query: graphqlDocumentTodoList
	},
	function(error){
		console.log(error);
	});

	observable.subscribe({
	    next(data) {
	      console.log(data);
	    },
	    error(error) {
	      console.error(error);
	    }
	});
*/
	// Knockout
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


	// Third example
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
				switch (data.todoList.status) {
    	        	case "added":
    	        		self.todoList3.insert(data.todoList.value);
    	        		break;
    	        	case "updated":
    	        		self.todoList3.upsert(data.todoList.value);
    	        		break;
    	        	case "deleted":
    	        		var _id = data.todoList.value._id;
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

};

document.addEventListener("DOMContentLoaded", function(event) { 
    ko.applyBindings(new TodoViewModel());
});

