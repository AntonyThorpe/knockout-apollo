"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const accept_1 = require("accept");
const graphql_playground_html_1 = require("@apollographql/graphql-playground-html");
const hapiApollo_1 = require("./hapiApollo");
var apollo_server_core_1 = require("apollo-server-core");
exports.GraphQLExtension = apollo_server_core_1.GraphQLExtension;
const apollo_server_core_2 = require("apollo-server-core");
function handleFileUploads(uploadsConfig) {
    return (request, _h) => __awaiter(this, void 0, void 0, function* () {
        if (typeof apollo_server_core_2.processFileUploads === 'function' &&
            request.mime === 'multipart/form-data') {
            Object.defineProperty(request, 'payload', {
                value: yield apollo_server_core_2.processFileUploads(request, request.response, uploadsConfig),
                writable: false,
            });
        }
    });
}
class ApolloServer extends apollo_server_core_2.ApolloServerBase {
    createGraphQLServerOptions(request, h) {
        const _super = Object.create(null, {
            graphQLServerOptions: { get: () => super.graphQLServerOptions }
        });
        return __awaiter(this, void 0, void 0, function* () {
            return _super.graphQLServerOptions.call(this, { request, h });
        });
    }
    supportsSubscriptions() {
        return true;
    }
    supportsUploads() {
        return true;
    }
    applyMiddleware({ app, cors, path, route, disableHealthCheck, onHealthCheck, }) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.willStart();
            if (!path)
                path = '/graphql';
            yield app.ext({
                type: 'onRequest',
                method: function (request, h) {
                    return __awaiter(this, void 0, void 0, function* () {
                        if (request.path !== path) {
                            return h.continue;
                        }
                        if (this.uploadsConfig && typeof apollo_server_core_2.processFileUploads === 'function') {
                            yield handleFileUploads(this.uploadsConfig)(request);
                        }
                        if (this.playgroundOptions && request.method === 'get') {
                            const accept = accept_1.parseAll(request.headers);
                            const types = accept.mediaTypes;
                            const prefersHTML = types.find((x) => x === 'text/html' || x === 'application/json') === 'text/html';
                            if (prefersHTML) {
                                const playgroundRenderPageOptions = Object.assign({ endpoint: path, subscriptionEndpoint: this.subscriptionsPath, version: this.playgroundVersion }, this.playgroundOptions);
                                return h
                                    .response(graphql_playground_html_1.renderPlaygroundPage(playgroundRenderPageOptions))
                                    .type('text/html')
                                    .takeover();
                            }
                        }
                        return h.continue;
                    });
                }.bind(this),
            });
            if (!disableHealthCheck) {
                yield app.route({
                    method: '*',
                    path: '/.well-known/apollo/server-health',
                    options: {
                        cors: cors !== undefined ? cors : true,
                    },
                    handler: function (request, h) {
                        return __awaiter(this, void 0, void 0, function* () {
                            if (onHealthCheck) {
                                try {
                                    yield onHealthCheck(request);
                                }
                                catch (_a) {
                                    const response = h.response({ status: 'fail' });
                                    response.code(503);
                                    response.type('application/health+json');
                                    return response;
                                }
                            }
                            const response = h.response({ status: 'pass' });
                            response.type('application/health+json');
                            return response;
                        });
                    },
                });
            }
            yield app.register({
                plugin: hapiApollo_1.graphqlHapi,
                options: {
                    path,
                    graphqlOptions: this.createGraphQLServerOptions.bind(this),
                    route: route !== undefined
                        ? route
                        : {
                            cors: cors !== undefined ? cors : true,
                        },
                },
            });
            this.graphqlPath = path;
        });
    }
}
exports.ApolloServer = ApolloServer;
exports.registerServer = () => {
    throw new Error('Please use server.applyMiddleware instead of registerServer. This warning will be removed in the next release');
};
//# sourceMappingURL=ApolloServer.js.map