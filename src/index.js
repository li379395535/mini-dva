var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import React, { useReducer, useContext } from 'react';
const LoadingAction = 'setLoading';
export function storeFactory({ state, effects, reducers }) {
    function useStore() {
        const reducerFn = (preState, action) => {
            const { type } = action;
            if (type === LoadingAction) {
                let { loading } = preState;
                if (!loading) {
                    loading = {};
                }
                loading = Object.assign(Object.assign({}, loading), action.payload);
                return Object.assign(Object.assign({}, preState), { loading });
            }
            else {
                if (reducers[type]) {
                    return reducers[type](preState, action);
                }
                return preState;
            }
        };
        const [store, put] = useReducer(reducerFn, state);
        const dispatch = (action) => __awaiter(this, void 0, void 0, function* () {
            const { type } = action;
            if (effects[type]) {
                try {
                    put({
                        type: LoadingAction,
                        payload: {
                            [type]: true,
                        }
                    });
                    yield effects[type](action, put);
                }
                finally {
                    put({
                        type: LoadingAction,
                        payload: {
                            [type]: false,
                        }
                    });
                }
            }
            else {
                put(action);
            }
        });
        return [store, dispatch];
    }
    return useStore;
}
export function modelFactory() {
    const Context = React.createContext([]);
    const useConnect = (mapFn) => {
        const [store, dispatch] = useContext(Context);
        if (mapFn) {
            return [mapFn(store), dispatch];
        }
        return [store, dispatch];
    };
    return [Context, useConnect];
}
export function registryModel(model) {
    const useStore = storeFactory(model);
    const [Context, useConnect] = modelFactory();
    return [Context, useConnect, useStore];
}
