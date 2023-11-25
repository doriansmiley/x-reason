'use server'
import { interpret, createMachine, StateMachine, MachineConfig, assign, State, StateNode, EventObject, DoneInvokeEvent } from 'xstate';
import { v4 as uuidv4 } from 'uuid';

interface IContext {
  requestId: string;
  status: number;
  stack?: string[];
  // ... other context properties
}

interface IEvent extends EventObject {
  type: 'PAUSE_EXECUTION' | 'RESUME_EXECUTION' | 'RETRY' | string;
}

interface StateMachineConfig {
  [key: string]: StateNode<IContext, any, IEvent>;
}

// Define the type for the step functions
type StepFunction = (context: IContext) => Promise<any>;

function statesMacro (stepsMap: Map<string, StepFunction>): StateMachineConfig {
  const stateMachineConfig: StateMachineConfig = {};

  stepsMap.forEach((value, key) => {
    const retrievedFunction = value;

    if (!retrievedFunction) {
      console.error(`Function not found for step: ${key}`);
      return;
    }

    stateMachineConfig[retrievedFunction.name] = {
      invoke: {
        //@ts-ignore
        id: retrievedFunction.name,
        src: (context: IContext, event: IEvent) => retrievedFunction(context),
        onDone: {
          target: 'success',
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
  });

  return stateMachineConfig;
};

export function machineMacro(
  stepsMap: Map<string, StepFunction>, domain: string
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
      paused: {
        on: { RESUME_EXECUTION: {
          target: 'resume',
          actions: assign<IContext, DoneInvokeEvent<IContext>>((context, event) => {
            return {
              ...context,
              ...event.data,
            }
          })
        } } // Transition to 'resume' on RESUME_EXECUTION
      },
      resume: {
        type: 'history', // Shallow history state
      },
      success: {
        type: 'final',
      },
      failure: {
        type: 'final',
      },
    },
    on: {
      PAUSE_EXECUTION: {
        target: '.paused',
        actions: assign<IContext, DoneInvokeEvent<IContext>>((context, event) => {
          return {
            ...context,
            ...event.data,
          }
        })
      }, // Transitions to paused state from any state
    }
  };

  const machine = createMachine(machineConfig);

  return (): Promise<IContext> => {
    return new Promise((resolve, reject) => {
      const withContext = machine.withContext({
        status: 0,
        requestId: uuidv4(),
        stack: [],
      });
      const machineExecution = interpret(withContext).onTransition((state) => {
        state.context.stack?.push(state.value as string);
        switch (state.value) {
          case "success":
            // TODO logging
            window.removeEventListener(`PAUSE_EXECUTION-${domain}`, pauseHandler);
            window.removeEventListener(`RESUME_EXECUTION-${domain}`, resumeHandler);
            resolve(state.context);
            break;
          case "failure":
            // TODO error reporting
            window.removeEventListener(`PAUSE_EXECUTION-${domain}`, pauseHandler);
            window.removeEventListener(`RESUME_EXECUTION-${domain}`, resumeHandler);
            reject(state.context);
            break;
        }
      });
  
      machineExecution.start();
  
      const pauseHandler = (event: Event) => {
        machineExecution.send('PAUSE_EXECUTION');
      }
  
      const resumeHandler = (event: Event) => {
        machineExecution.send('RESUME_EXECUTION');
      }
  
      // To allow functions forward events we need to have React dispatch events on the window
      // we need to use a domain name as well to sandbox events
      window.addEventListener(`PAUSE_EXECUTION-${domain}`, pauseHandler);
      window.addEventListener(`RESUME_EXECUTION-${domain}`, resumeHandler);
    });
  };
}

