import { Server, Request, RouteOptions } from 'hapi';
import { GraphQLOptions } from 'apollo-server-core';
export interface IRegister {
    (server: Server, options: any, next?: Function): void;
}
export interface IPlugin {
    name: string;
    version?: string;
    register: IRegister;
}
export interface HapiOptionsFunction {
    (request?: Request): GraphQLOptions | Promise<GraphQLOptions>;
}
export interface HapiPluginOptions {
    path: string;
    vhost?: string;
    route?: RouteOptions;
    graphqlOptions: GraphQLOptions | HapiOptionsFunction;
}
declare const graphqlHapi: IPlugin;
export { graphqlHapi };
//# sourceMappingURL=hapiApollo.d.ts.map