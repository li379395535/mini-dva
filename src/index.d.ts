import React, { Reducer } from 'react';
interface IMapper<T = string> {
    [key: string]: T;
}
interface IAction<T = string> {
    type: T;
    payload?: IMapper<any> | any;
    callback?: Function;
}
interface IDispatch<T = string> {
    (action: IAction<T>): void;
}
interface ILoading {
    loading?: IMapper<boolean>;
}
declare type LoadingState<S> = S & ILoading;
export interface IModel<S> {
    state: LoadingState<S>;
    effects: IMapper<(action: IAction, put: IDispatch) => Promise<void>>;
    reducers: IMapper<Reducer<LoadingState<S>, IAction>>;
}
interface IMapFn<S> {
    (state: LoadingState<S>): any;
}
declare type IStore<S> = [LoadingState<S>, IDispatch];
export declare function storeFactory<S>({ state, effects, reducers }: IModel<S>): () => IStore<S>;
export declare function modelFactory<S>(): [
    React.Context<IStore<S>>,
    (mapFn?: IMapFn<S>) => IStore<S>
];
export declare function registryModel<S>(model: IModel<S>): [
    React.Context<IStore<S>>,
    (mapFn?: IMapFn<S>) => IStore<S>,
    () => IStore<S>
];
export {};
