"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const boom_1 = __importDefault(require("boom"));
const apollo_server_core_1 = require("apollo-server-core");
const graphqlHapi = {
    name: 'graphql',
    register: (server, options, next) => {
        if (!options || !options.graphqlOptions) {
            throw new Error('Apollo Server requires options.');
        }
        server.route({
            method: ['GET', 'POST'],
            path: options.path || '/graphql',
            vhost: options.vhost || undefined,
            options: options.route || {},
            handler: (request, h) => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { graphqlResponse, responseInit } = yield apollo_server_core_1.runHttpQuery([request, h], {
                        method: request.method.toUpperCase(),
                        options: options.graphqlOptions,
                        query: request.method === 'post'
                            ?
                                request.payload
                            : request.query,
                        request: apollo_server_core_1.convertNodeHttpToRequest(request.raw.req),
                    });
                    const response = h.response(graphqlResponse);
                    Object.keys(responseInit.headers).forEach(key => response.header(key, responseInit.headers[key]));
                    return response;
                }
                catch (error) {
                    if ('HttpQueryError' !== error.name) {
                        throw boom_1.default.boomify(error);
                    }
                    if (true === error.isGraphQLError) {
                        const response = h.response(error.message);
                        response.code(error.statusCode);
                        response.type('application/json');
                        return response;
                    }
                    const err = new boom_1.default(error.message, { statusCode: error.statusCode });
                    if (error.headers) {
                        Object.keys(error.headers).forEach(header => {
                            err.output.headers[header] = error.headers[header];
                        });
                    }
                    err.output.payload.message = error.message;
                    throw err;
                }
            }),
        });
        if (next) {
            next();
        }
    },
};
exports.graphqlHapi = graphqlHapi;
//# sourceMappingURL=hapiApollo.js.map