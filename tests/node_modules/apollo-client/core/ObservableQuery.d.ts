import { GraphQLError } from 'graphql';
import { NetworkStatus } from './networkStatus';
import { Observable } from '../util/Observable';
import { QueryScheduler } from '../scheduler/scheduler';
import { ApolloError } from '../errors/ApolloError';
import { ApolloQueryResult } from './types';
import { ModifiableWatchQueryOptions, WatchQueryOptions, FetchMoreQueryOptions, SubscribeToMoreOptions, ErrorPolicy } from './watchQueryOptions';
import { QueryStoreValue } from '../data/queries';
export declare type ApolloCurrentResult<T> = {
    data: T | {};
    errors?: GraphQLError[];
    loading: boolean;
    networkStatus: NetworkStatus;
    error?: ApolloError;
    partial?: boolean;
};
export interface FetchMoreOptions {
    updateQuery: (previousQueryResult: {
        [key: string]: any;
    }, options: {
        fetchMoreResult?: {
            [key: string]: any;
        };
        variables: {
            [key: string]: any;
        };
    }) => Object;
}
export interface UpdateQueryOptions {
    variables?: Object;
}
export declare const hasError: (storeValue: QueryStoreValue, policy?: ErrorPolicy) => true | Error | null | undefined;
export declare class ObservableQuery<T> extends Observable<ApolloQueryResult<T>> {
    options: WatchQueryOptions;
    queryId: string;
    /**
     *
     * The current value of the variables for this query. Can change.
     */
    variables: {
        [key: string]: any;
    };
    private isCurrentlyPolling;
    private shouldSubscribe;
    private isTornDown;
    private scheduler;
    private queryManager;
    private observers;
    private subscriptionHandles;
    private lastResult;
    private lastError;
    private lastVariables;
    constructor({scheduler, options, shouldSubscribe}: {
        scheduler: QueryScheduler<any>;
        options: WatchQueryOptions;
        shouldSubscribe?: boolean;
    });
    result(): Promise<ApolloQueryResult<T>>;
    /**
     * Return the result of the query from the local cache as well as some fetching status
     * `loading` and `networkStatus` allow to know if a request is in flight
     * `partial` lets you know if the result from the local cache is complete or partial
     * @return {result: Object, loading: boolean, networkStatus: number, partial: boolean}
     */
    currentResult(): ApolloCurrentResult<T>;
    getLastResult(): ApolloQueryResult<T>;
    getLastError(): ApolloError;
    resetLastResults(): void;
    refetch(variables?: any): Promise<ApolloQueryResult<T>>;
    fetchMore(fetchMoreOptions: FetchMoreQueryOptions & FetchMoreOptions): Promise<ApolloQueryResult<T>>;
    subscribeToMore(options: SubscribeToMoreOptions): () => void;
    setOptions(opts: ModifiableWatchQueryOptions): Promise<ApolloQueryResult<T>>;
    /**
     * Update the variables of this observable query, and fetch the new results
     * if they've changed. If you want to force new results, use `refetch`.
     *
     * Note: if the variables have not changed, the promise will return the old
     * results immediately, and the `next` callback will *not* fire.
     *
     * Note: if the query is not active (there are no subscribers), the promise
     * will return null immediately.
     *
     * @param variables: The new set of variables. If there are missing variables,
     * the previous values of those variables will be used.
     *
     * @param tryFetch: Try and fetch new results even if the variables haven't
     * changed (we may still just hit the store, but if there's nothing in there
     * this will refetch)
     *
     * @param fetchResults: Option to ignore fetching results when updating variables
     *
     */
    setVariables(variables: any, tryFetch?: boolean, fetchResults?: boolean): Promise<ApolloQueryResult<T>>;
    updateQuery(mapFn: (previousQueryResult: any, options: UpdateQueryOptions) => any): void;
    stopPolling(): void;
    startPolling(pollInterval: number): void;
    private onSubscribe(observer);
    private setUpQuery();
    private tearDownQuery();
}
