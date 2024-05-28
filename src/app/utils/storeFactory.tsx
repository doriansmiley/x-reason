"use client";
import React, { createContext, useContext, useReducer, createServerContext } from "react";

export const APP_CONTEXT_IDENTIFIER = Symbol.for("appContext");

export type ActionType = {
  type: string;
  value?: Record<string, unknown>;
  payload?: Record<string, unknown>;
};

export type AppContextType<T, A = undefined> = {
  useDispatch: () => React.Dispatch<A extends undefined ? ActionType : A>;
  useStore: () => T;
};

export type DispatchType<A> = (action: A) => void;

export type ReducerType<S, A> = (state: S, action: A) => S;

type PropsType<S> = {
  children?: React.ReactNode;
  initialState?: Partial<S>;
};

export function makeStore<S, A>(initialState: S, reducer: ReducerType<S, A>): [(props: PropsType<S>) => JSX.Element, () => DispatchType<A>, () => S] {
  const dispatchContext = createContext((action: A) => { });
  const storeContext = createContext<S>(initialState);

  const StoreProvider = ({ children, initialState: propsInitialState }: PropsType<S>) => {
    const [store, dispatch] = useReducer(reducer, {
      ...initialState,
      ...propsInitialState,
    });

    return (
      <dispatchContext.Provider value={dispatch}>
        <storeContext.Provider value={store}>{children}</storeContext.Provider>
      </dispatchContext.Provider>
    );
  };

  function useDispatch() {
    return useContext(dispatchContext);
  }

  function useStore() {
    return useContext(storeContext);
  }

  return [StoreProvider, useDispatch, useStore];
}
