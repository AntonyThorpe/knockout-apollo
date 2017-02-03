/**
 * knockout-apollo
 *
 * A knockoutjs extension to connect to a GraphQL endpoint through an ApolloClient instance
 */
;
(function(factory) {
	//CommonJS
	if (typeof require === "function" && typeof exports === "object" && typeof module === "object") {
		factory(require("knockout"), exports);
		//AMD
	} else if (typeof define === "function" && define.amd) {
		define(["knockout", "exports"], factory);
		//normal script tag
	} else {
		factory(ko);
	}
}(function(ko) {

	/**
	 * Knockout Custom function to create an instance of the ApolloClient on @example this.yourObservable.apollo
	 *
	 * @param  {ApolloClient} client
	 * @param  {function} reject Custom error handler
	 * @return {this} to enable chaining other functions onto an observable
	 * @example	this.yourObservable.launchApollo(apolloClient, errorFunction);
	 */
	ko.observable.fn.launchApollo = function(client, reject) {
	    // Definitions
	    var self = this;
	    self.method = null;
	    self.resolve = null;
	    self.always = null;
	    if (reject) {
	        self.reject = reject;
	    } else {
	        self.reject = function(error){
	            console.error('Error: ', error);
	        };
	    }

	    /**
	     * A method to call the GraphQL endpoint and process the results via various callbacks.
	     * The `this.yourObservable.apollo` is the ApolloClient @link http://dev.apollodata.com/core/apollo-client-api.html
	     */
	    self.apollo = ko.command({
			/**
		     * @param {object} params the object sent by the client method
		     * @param {object} callback contains the functions called when:
		     *                            1) the Promise is successfully completed (key: resolve)
		     *                            2) the Promise fails (key: reject)
		     *                            3) in both cases (key: always)
		     * @example	this.yourObservable.apollo(
		     *          	{
		     *          		query: graphQL_template_literal_tag,
		     *          		variables: {
		     *            			message: "Hello World"
		     *          		}
		     *          	},
		     *          	{
		     *          		resolve: function(data) {
		     *            			// need to use var self = this; to reach callback
		     *          			self.yourObservable(data.data.graphQL_function_name);
		     *          		},
		     *          		reject: function(error) {
		     *          			console.log("opps " + error);
		     *          		},
		     *          		always: function(data) {
		     *          			// called for both success and failure of call
		     *          		}
		     *          	}
		     *          );
		     */
			action: function(params, callback){
	            self.resolve = callback.resolve;
	            self.always = callback.allways;
	            if (callback.reject) {
	                self.reject = reject;
	            }

	            // Determine the client method to be called
	            var keys = ["query", "mutation", "watchQuery", "setStore", "resetStore"];
	            var key = ko.utils.arrayFilter(keys, function(item){
	                return item in params;
	            });
	            self.method = params[key[0]].definitions[0].operation;
	            if (self.method === "mutation") {
	                self.method = "mutate";
	            }
	            if (self.method === "subscription") {
					// todo
					//self.method = subscribe;
	            }

				// Call the GraphQL endpoint
	            if (self.method) {
	                return client[self.method](params);
	            } else {
	                console.error("Error: the client method must be specified as a key in the object.  One of " + keys);
	            }

	        },
	        /**
	         * A function called when successful
	         * @param {ApolloQueryResult} data @link http://dev.apollodata.com/core/apollo-client-api.html#ApolloQueryResult
	         */
	        done: function(data){
	            if (self.method !== "subscribe" && self.resolve) {
	                self.resolve(data);
	            }
	        },
			/**
			 * A function called when unsuccessful
			 * @param  {ApolloError} error
			 * @link http://dev.apollodata.com/core/apollo-client-api.html#ApolloError
			 */
	        fail: function(error){
	            self.reject(error);
	        },
			/**
			 * A function called for success or failure of the call
			 * @param  {ApolloQueryResult|ApolloError} data
			 */
	        always: function(data){
	            if (self.always) {
	                self.always(data);
	            }
	        },
	        context: self
	    });

	    return this;
	};
})); // close module loader
