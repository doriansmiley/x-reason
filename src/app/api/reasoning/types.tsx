import { EventObject, StateNode, StateMachine } from "xstate";

export type Context = {
  requestId: string;
  status: number;
  stack?: string[];
  // Index signature for additional properties
  [key: string]: any;
};

export type MachineEvent = {
  type: "PAUSE_EXECUTION" | "RESUME_EXECUTION" | "RETRY" | "INVOKE" | string;
  payload?: { [key: string]: any };
} & EventObject;

export type Task = {
  description: string;
  implementation: (context: Context, event: MachineEvent) => void;
  component?: (context: Context, event: MachineEvent) => JSX.Element;
  transitions?: Map<"CONTINUE" | "ERROR", (context: Context, event: MachineEvent) => boolean>
};

export interface StateMachineConfig {
  [key: string]: StateNode<Context, any, MachineEvent>;
}

export type Solver = {
  // generates the instructions for solving the query
  solve(query: string): Promise<string>;
};

export type Programer = {
  // the input is the result of Solver.solve
  // generates the state machine config used by the interpreter
  program(query: string, functionCatalog: string): Promise<StateConfig[]>;
};

export type EvaluationInput = {
  query: string;
  instructions: string;
  states: StateConfig[];
};

export type EvaluatorResult = { rating: number; error?: Error };

export type Evaluator = {
  // takes the user's query with the generated instructions from the solver
  // and the output machine config from the programmer
  evaluate(input: EvaluationInput): Promise<EvaluatorResult>;
};

export type ReasoningEngine = {
  solver: Solver;
  programmer: Programer;
  evaluator: Evaluator;
};

export interface ICallable {
  (...args: any[]): any;
}

export type InterpreterInput = {
  functions: Map<string, Task>;
  states: StateConfig[];
  context?: Context;
};

export type Interpreter = {
  interpret(input: InterpreterInput): void;
};

export type StateConfig = {
  id: string;
  transitions?: Array<{
    on: string;
    target: string;
    cond?: string;
    actions?: string;
  }>;
  type?: "parallel" | "final";
  onDone?: string;
  states?: StateConfig[];
};
