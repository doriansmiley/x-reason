import { interpret } from 'xstate';
import { v4 as uuidv4 } from 'uuid';

import { machineMacro} from './statesMacros'; // Adjust the import path

describe('machineMacro', () => {
  const mockSteps = new Map();

  beforeAll(() => {
    mockSteps.set('step1', {id: 'step1', func: jest.fn().mockResolvedValue({
      step1Log: {
        message: 'Step 1 completed',
      }
    })});
    mockSteps.set('step2', {id: 'step2', func: jest.fn().mockResolvedValue({
      step2Log: {
        message: 'Step 2 completed',
      }
    })});
    mockSteps.set('pauseStep', {id: 'pauseStep', type: 'pause', func: jest.fn().mockResolvedValue({
      step3Log: {
        message: 'Step 3 completed',
      }
    })});
    mockSteps.set('resumeStep', {id: 'resumeStep', func: jest.fn().mockResolvedValue({
      step4Log: {
        message: 'Step 4 completed',
      }
    })});
    mockSteps.set('step5', {id: 'step5', func: jest.fn().mockResolvedValue({
      step5Log: {
        message: 'Step 5 completed',
      }
    })});
  });

  it('should pause and resume the state machine', async () => {
    return new Promise((resolve, reject) => {
      const testMachine = machineMacro(mockSteps);

      const withContext = testMachine.withContext({
        status: 0,
        requestId: uuidv4(),
        stack: [],
      });

      const machineExecution = interpret(withContext).onTransition((state) => {
        const type = machineExecution.machine.states[state.value as string]?.meta?.type;
        console.log(`onTransition state.value: ${state.value}`);
        // console.log(`onTransition state.meta.type: ${type}`);
        state.context.stack?.push(state.value as string);
        switch (state.value) {
          case "success":
            // TODO logging
            console.log(JSON.stringify(state.context));
            expect(mockSteps.get('resumeStep').func).toHaveBeenCalled();
            expect(machineExecution.machine.context.stack?.length).toBe(6);
            resolve(state.context);
            break;
          case "failure":
            // TODO error reporting
            reject(state.context);
            break;
          default:
            //console.log(`state.meta.type === 'pause': ${type === 'pause'}`)
            //@ts-ignore
            if (type === 'pause') {
              // Introduce a delay before resuming execution
              setTimeout(() => {
                machineExecution.send('RESUME_EXECUTION');
              }, 1000); // Delay of 1 second
            }
        }
      });

      machineExecution.start();
    });
  });
});
