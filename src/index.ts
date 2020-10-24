import React, { useCallback, useReducer, Reducer, useContext } from 'react';

interface IMapper<T=string> {
  [key: string]: T;
}

interface IAction<T = string> {
  type: T;
  payload?: IMapper<any>;
  callback?: Function;
}

interface IDispatch<T=string> {
  (action: IAction<T>): void;
}

interface ILoading {
  loading: IMapper<boolean>;
}

type LoadingState<S> = S & ILoading;

interface IModal<S> {
  state: LoadingState<S>;
  effects: IMapper<(action: IAction, put: IDispatch) => Promise<void>>;
  reducer: IMapper<Reducer<LoadingState<S>, IAction>>;
}

interface IMapFn<S> {
  (state: LoadingState<S>): any;
}

const LoadingAction = 'setLoading';

export function useStoreFactory<S>({ state, effects, reducer }: IModal<S>): [LoadingState<S>, IDispatch ] {
  const reducerFn:Reducer<LoadingState<S>, IAction> = useCallback((preState, action) => {
    const {type} = action;
    if (type === LoadingAction) {
      let { loading } = preState;
      if (!loading) {
        loading = {}
      }

      loading = { ...loading, ...action.payload};
      return {...preState, loading };
    } else {
      if (reducer[type]) {
        return reducer[type](preState, action);
      }
      return preState;
    }
  }, []);
  const [store, put] = useReducer<Reducer<LoadingState<S>, IAction>>(reducerFn, state)
  const dispatch:IDispatch = useCallback(async (action) => {
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
  }, [put, effects]);
  return [store, dispatch];
}

export function useContextFactory<S>(modal: IModal<S>) {
  const [store, dispatch] = useStoreFactory<S>(modal);
  const Context = React.createContext<[LoadingState<S>, IDispatch]>([store, dispatch]);
  const useConnect = (mapFn?: IMapFn<S>) => {
    const [store, dispatch] = useContext(Context);
    if (mapFn) {
      return [mapFn(store), dispatch];
    }
    return useContext(Context);
  }
  return [Context, useConnect];
}

