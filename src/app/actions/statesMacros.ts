'use server'
import { createMachine, MachineConfig, assign, StateNode, EventObject, DoneInvokeEvent } from 'xstate';

export interface IContext {
  requestId: string;
  status: number;
  stack?: string[];
  // ... other context properties
}

export interface IEvent extends EventObject {
  type: 'PAUSE_EXECUTION' | 'RESUME_EXECUTION' | 'RETRY' | string;
}

interface StateMachineConfig {
  [key: string]: StateNode<IContext, any, IEvent>;
}

// Define the type for the step functions
type StepFunction = (context: IContext) => Promise<any>;

function statesMacro (stepsMap: Map<string, {id: string, func: StepFunction , type?: 'pause' | 'async'}>): StateMachineConfig {
  const stateMachineConfig: StateMachineConfig = {};
  const steps = Array.from(stepsMap.entries());

  steps.forEach((value, index) => {
    const {id, func, type} = value[1];
    // console.log(`retrievedFunction: ${id}`);

    if (!func) {
      console.error(`Function not found for step: ${id}`);
      return;
    }

    if (type && type === 'pause') {
      stateMachineConfig[id] = {
        meta: {
          type,
        },
        on: { 
          RESUME_EXECUTION: {
            // @ts-ignore
            target: steps[index + 1]?.[1]?.id || 'success',
            actions: assign<IContext, DoneInvokeEvent<IContext>>((context, event) => {
              return {
                ...context,
                ...event.data,
              }
            })
          },
        },
      };
    }
    else {
      stateMachineConfig[id] = {
        meta: {
          type: 'async',
        },
        invoke: {
          //@ts-ignore
          id: id,
          src: (context: IContext, event: IEvent) => func(context),
          onDone: {
            // target the next item in the array or success (final)
            target: steps[index + 1]?.[1]?.id || 'success',
            actions: assign<IContext, DoneInvokeEvent<IContext>>((context, event) => {
              return {
                ...context,
                ...event.data,
              }
            }),
          },
          onError: {
            target: 'failure',
            actions: assign<IContext, DoneInvokeEvent<IContext>>((context, event) => {
              return {
                ...context,
                ...event.data,
              }
            }),
          }
        }
      };
    }
  });
  console.log(JSON.stringify(stateMachineConfig));
  return stateMachineConfig;
};

export function machineMacro(
  stepsMap: Map<string, {id: string, func: StepFunction}>
) {

  const states = statesMacro(stepsMap)

  const initialKey = Object.keys(states)[0];

  const machineConfig: MachineConfig<IContext, any, IEvent> = {
    predictableActionArguments: true,
    schema: {
      context: {} as IContext,
      events: {} as IEvent,
    },
    initial: initialKey,
    context: {
      requestId: "",
      status: 0,
    },
    states: {
      ...states,
      success: {
        type: 'final',
      },
      failure: {
        type: 'final',
      },
    },
  };

  console.log(JSON.stringify(machineConfig))

  const machine = createMachine(machineConfig);

  return machine;
}

