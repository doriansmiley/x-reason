"use client";
import { ActionType, makeStore, factory } from "@/app/utils";
import { MachineEvent, Context, StateConfig, Task, Prompt } from "@/app/api/reasoning";
import { chemliEvaluate, chemliSolver, chemliProgrammer, chemliFunctionCatalog, chemliToolsCatalog } from "./chemli";
import { Factory } from "@/app/utils/factory";

export type ReasonContextType = {
    callback?: (event: MachineEvent) => void,
    query?: string,
    solution?: string,
    states?: StateConfig[],
    currentState?: string,
    context?: Context,
    event?: MachineEvent,
    functions?: Map<string, Task>;
    factory: Factory<Context, {
        programmer: Prompt,
        solver: Prompt,
        evaluate: Prompt,
        getFunctionCatalog: (dispatch: (action: ActionType) => void) => Map<string, Task>,
        getToolsCatalog: () => Map<string, { description: string }>
    }>;
    [key: string]: any;
};

const appInitialState: ReasonContextType = {
    callback: (event: MachineEvent) => console.log("default callback called"),
    states: [],
    factory: factory({
        chemli: (context: Context) => {
            return {
                programmer: chemliProgrammer,
                solver: chemliSolver,
                evaluate: chemliEvaluate,
                getFunctionCatalog: chemliFunctionCatalog,
                getToolsCatalog: chemliToolsCatalog,
            };
        },
        regie: (context: Context) => {
            // TODO
            return { todo: 'todo' };
        },
    }),
}

export enum ReasonDemoActionTypes {
    SET_STATE = "setFormula",
};

export enum EngineTypes {
    CHEMLI = "chemli",
    REGIE = "regie",
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
