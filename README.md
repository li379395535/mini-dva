# mini-dva
 
# install
#### npm
```
npm install -S mini-dva
```
#### yarn
```
yarn add mini-dva
```

# demo

#### model.ts
```
import { IModel, registryModel } from 'mini-dva';

interface IStateType {
  count: number;
}

const Model: IModel<IStateType> = {
  state: {
    count: 0,
  },
  effects: {
    add : async function ({ payload }, put) {
    const res = await new Promise((resolve) => {
      setTimeout(() => {
        resolve(payload+1);
      }, 3000)
    });
    put({
      type: 'setCount',
      payload: res,
    })
  }

  } ,
  reducers: {
    setCount(prevState, { payload }) {
      return { ...prevState, count: payload };
    }
  }
}

export const [Context, useConnect, useStore] = registryModel(Model);
```

#### /src/index.tsx
```
import { Context, useConnect } from './modal';
import Count from './Count';
import ReactDOM from 'react-dom';

const HomePage = () => {
  const modal = useConnect();
  return (
    <Context.Provider value={modal}>
      <Count />
    </Context.Provider>
  )
}
```

#### Count.tsx
```
import React, { FC, useCallback } from 'react';
import { useConnect } from './modal';


const Count: FC = () => {
  const [model, dispatch] = useConnect();
  const { count } = model;
  const handleClick = useCallback(() => {
    dispatch({
      type: "add",
      payload: count,
    })
  }, [count, dispatch])

  return (
    <div>
      <span>{count}</span>
      <button onClick={handleClick}>Add</button>
    </div>
  )
}
```