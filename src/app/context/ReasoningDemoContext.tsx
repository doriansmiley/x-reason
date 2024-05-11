"use client";
import { ActionType, makeStore } from "@/app/utils";
import { MachineEvent, Context, StateConfig, Task } from "@/app/api/reasoning";

export type ReasonContextType = {
    callback?: (event: MachineEvent) => void,
    query?: string,
    solution?: string,
    states?: StateConfig[],
    currentState?: string,
    context?: Context,
    event?: MachineEvent,
    functions?: Map<string, Task>;
};

const appInitialState: ReasonContextType = {
    callback: (event: MachineEvent) => console.log("default callback called"),
    states: [],
}

export enum ReasonDemoActionTypes {
    SET_STATE = "setFormula",
};

const appReducer = (state: ReasonContextType, action: ActionType): ReasonContextType => {
    switch (action.type) {
        case ReasonDemoActionTypes.SET_STATE: // example for specific handlers
        default: {
            return {
                ...state,
                ...action.value,
            };
        }
    }
};

const [Provider, useDispatch, useStore] = makeStore<ReasonContextType, ActionType>(appInitialState, appReducer);

export { Provider as ReasonDemoProvider, useDispatch as useReasonDemoDispatch, useStore as useReasonDemoStore };
