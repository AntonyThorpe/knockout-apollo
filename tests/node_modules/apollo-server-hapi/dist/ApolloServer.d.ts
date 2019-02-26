import hapi from 'hapi';
export { GraphQLOptions, GraphQLExtension } from 'apollo-server-core';
import { ApolloServerBase, GraphQLOptions } from 'apollo-server-core';
export declare class ApolloServer extends ApolloServerBase {
    createGraphQLServerOptions(request: hapi.Request, h: hapi.ResponseToolkit): Promise<GraphQLOptions>;
    protected supportsSubscriptions(): boolean;
    protected supportsUploads(): boolean;
    applyMiddleware({ app, cors, path, route, disableHealthCheck, onHealthCheck, }: ServerRegistration): Promise<void>;
}
export interface ServerRegistration {
    app?: hapi.Server;
    path?: string;
    cors?: boolean | hapi.RouteOptionsCors;
    route?: hapi.RouteOptions;
    onHealthCheck?: (request: hapi.Request) => Promise<any>;
    disableHealthCheck?: boolean;
    uploads?: boolean | Record<string, any>;
}
export declare const registerServer: () => never;
//# sourceMappingURL=ApolloServer.d.ts.map