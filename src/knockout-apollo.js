/**
 * knockout Apollo
 *
 * A knockoutjs extension to connect to a GraphQL endpoint through an Apollo Client instance
 */
(function(factory) {
    // CommonJS
    if (
        typeof require === "function" &&
        typeof exports === "object" &&
        typeof module === "object"
    ) {
        factory(require("knockout"), exports);
        // AMD
    } else if (typeof define === "function" && define.amd) {
        define(["knockout", "exports"], factory);
        // normal script tag
    } else {
        factory(ko);
    }
})(function(ko) {
    /**
     * Knockout Custom Function to hold an instance of the ApolloClient on self.yourObservable.apollo
     * @param  {object} client the Apollo Client
     * @param  {function} reject Custom error handler
     * @return {this} to enable chaining other functions onto an observable
     * @example	this.yourObservable.launchApollo(apolloClient, errorCallback);
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
            self.reject = function(error) {
                console.error(error);
            };
        }

        /**
         * Call the GraphQL endpoint and process the results via various callbacks
         * @see https://www.apollographql.com/docs/react/reference/index.html
         */
        self.apollo = ko.command({
            /**
             * @param {object} graphqlDocument sent by the client method
             * @param {object} callback contains the functions called when:
             *                 1) the Promise is successfully completed (key: resolve)
             *                 2) the Promise fails (key: reject)
             *                 3) in both cases (key: always)
             * @return {object} the Apollo Client
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
            action: function(graphqlDocument, callback) {
                self.resolve = callback.resolve;
                self.always = callback.allways;
                if (callback.reject) {
                    self.reject = callback.reject;
                }

                // Determine the Apollo Client/Observable Query method
                var methods = ["query", "mutation", "mutate", "watchQuery", "subscribe", "readQuery", "readFragment", "writeQuery", "writeFragment", "resetStore", "onResetStore", "clearStore", "onClearStore", "stop", "reFetchObservableQueries"];

                self.method = ko.utils.arrayFirst(methods, function(item) {
                    return item in graphqlDocument;
                });

                if (self.method === "mutation") {
                    self.method = "mutate";
                }

                // Call the GraphQL endpoint
                if (self.method) {
                    return client[self.method](graphqlDocument);
                }
                console.error(
                    "Error: the client method must be specified as a key in the object.  One of: " + methods.join(', ')
                );
            },
            /**
             * A function called when successful
             * @param {object} data an ApolloQueryResult
             * @link { ApolloQueryResult, http://dev.apollodata.com/core/apollo-client-api.html#ApolloQueryResult }
             * @link{ Subscription, http://dev.apollodata.com/core/apollo-client-api.html#ObservableQuery}
             */
            done: function(data) {
                if (self.resolve) {
                    self.resolve(data);
                }
            },
            /**
             * A function called when unsuccessful
             * @param  {object} error an ApolloError
             * @link http://dev.apollodata.com/core/apollo-client-api.html#ApolloError
             */
            fail: function(error) {
                self.reject(error);
            },
            /**
             * A function called for success or failure of the call
             * @param  {object} data an ApolloQueryResult or ApolloError
             */
            always: function(data) {
                if (self.always) {
                    self.always(data);
                }
            },
            context: self
        });

        return this;
    };

    /**
     * Knockout Custom Function for subcriptions via the ApolloClient
     * @param  {object} client an ApolloClient
     * @param  {function} reject Custom error handler
     * @return {this} to enable chaining of other functions onto an observable
     * @example	this.yourObservable.liftOffSubscription(apolloClient, errorCallback);
     */
    ko.observable.fn.liftOffSubscription = function(client, reject) {
        // Definitions
        var self = this;
        if (reject) {
            self.reject = reject;
        } else {
            self.reject = function(error) {
                console.error(error);
            };
        }

        /**
         * Start a GraphQL Subscription
         * @param  {object} graphqlDocument sent by the ApolloClient
         * @param  {object} callback contains the functions called when:
         *                  1) the observable succcessfully returns data (key: next)
         *                  2) the observable fails (key: error)
         *                  3) the next or error functions are completed (key: complete)
         * @property {object} the Graphql Subscription
         */
        self.startGraphqlSubscription = function(graphqlDocument, callback) {
            // Definitions
            if (callback.reject) {
                self.reject = callback.reject;
            }

            // holds the subscription
            // @{link https://www.apollographql.com/docs/react/features/subscriptions.html}
            self.graphqlSubscription = client.subscribe(
                graphqlDocument,
                function(error) {
                    self.reject(error);
                }
            );

            self.graphqlSubscription.subscribe({
                next: function next(data) {
                    callback.next(data);
                },
                error: function error(error) {
                    self.reject(error);
                },
                complete: function complete(data) {
                    if (callback.complete) {
                        callback.complete(data);
                    }
                }
            });
        };
        return this;
    };
});
