import React, { useCallback, useReducer, Reducer, useContext } from 'react';

interface IMapper<T=string> {
  [key: string]: T;
}

interface IAction<T = string> {
  type: T;
  payload?: IMapper<any> | any;
  callback?: Function;
}

interface IDispatch<T=string> {
  (action: IAction<T>): void;
}

interface ILoading {
  loading?: IMapper<boolean>;
}

type LoadingState<S> = S & ILoading;

export interface IModel<S> {
  state: LoadingState<S>;
  effects: IMapper<(action: IAction, put: IDispatch) => Promise<void>>;
  reducers: IMapper<Reducer<LoadingState<S>, IAction>>;
}

interface IMapFn<S> {
  (state: LoadingState<S>): any;
}

const LoadingAction = 'setLoading';

type IStore<S> = [LoadingState<S>, IDispatch];

export function storeFactory<S>({
  state, effects, reducers
}: IModel<S>) {
  function useStore(): IStore<S> {
    const reducerFn:Reducer<LoadingState<S>, IAction> = (preState, action) => {
      const {type} = action;
      if (type === LoadingAction) {
        let { loading } = preState;
        if (!loading) {
          loading = {}
        }
  
        loading = { ...loading, ...action.payload};
        return {...preState, loading };
      } else {
        if (reducers[type]) {
          return reducers[type](preState, action);
        }
        return preState;
      }
    };
    const [store, put] = useReducer<Reducer<LoadingState<S>, IAction>>(reducerFn, state)
    const dispatch:IDispatch = async (action) => {
      const { type } = action;
      if(effects[type]) {
        try {
          put({
            type: LoadingAction,
            payload: {
              [type]: true,
            }
          })
          await effects[type](action, put);
        } finally {
          put({
            type: LoadingAction,
            payload: {
              [type]: false,
            }
          })
        }
      } else {
        put(action);
      }
    };
    return [store, dispatch];

  }

  return useStore;
}

export function modelFactory<S>()
  : [
    React.Context<IStore<S>>,
    (mapFn?: IMapFn<S>) => IStore<S>
  ] {
  const Context = React.createContext<IStore<S>>([] as any);
  const useConnect = (mapFn?: IMapFn<S>): IStore<S> => {
    const [store, dispatch] = useContext(Context);
    if (mapFn) {
      return [mapFn(store), dispatch];
    }
    return [store, dispatch];
  }
 
  return [Context, useConnect];
}

export function registryModel<S>(model: IModel<S>)
  : [
      React.Context<IStore<S>>,
      (mapFn?: IMapFn<S>) => IStore<S>,
      () => IStore<S>,
    ]
{
  const useStore = storeFactory(model);
  const [Context, useConnect] = modelFactory<S>();
  return [Context, useConnect, useStore];
}

