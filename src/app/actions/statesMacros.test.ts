import { machineMacro } from './statesMacros'; // Adjust the import path
import { act } from 'react-dom/test-utils';

describe('machineMacro', () => {
  const mockSteps = new Map();

  beforeAll(() => {
    mockSteps.set('step1', jest.fn().mockResolvedValue('Step 1 completed'));
    mockSteps.set('step2', jest.fn().mockResolvedValue('Step 2 completed'));
    mockSteps.set('pauseStep', jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          window.dispatchEvent(new Event('PAUSE_EXECUTION-testDomain'));
          resolve('Paused');
        }, 100); // Simulating async operation
      });
    }));
    mockSteps.set('resumeStep', jest.fn().mockImplementation(() => {
      return new Promise((resolve) => {
        setTimeout(() => {
          window.dispatchEvent(new Event('RESUME_EXECUTION-testDomain'));
          resolve('Resumed');
        }, 100); // Simulating async operation
      });
    }));
    mockSteps.set('step5', jest.fn().mockResolvedValue('Step 5 completed'));
  });

  it('should pause and resume the state machine', async () => {
    jest.useFakeTimers();
    const testMachine = machineMacro(mockSteps, 'testDomain');
    let currentState = null;

    const promise = testMachine().then(state => {
      currentState = state;
    });

    // Simulate time to allow state machine to run and pause
    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockSteps.get('pauseStep')).toHaveBeenCalled();
    expect(currentState).toBeNull(); // Still null because it's paused

    // Resume the machine
    window.dispatchEvent(new Event('RESUME_EXECUTION-testDomain'));

    // Simulate time to allow state machine to complete
    await act(async () => {
      jest.runAllTimers();
    });

    expect(mockSteps.get('resumeStep')).toHaveBeenCalled();
    expect(currentState).not.toBeNull();
    expect(currentState).toHaveProperty('status', expect.any(Number));
    // ... additional assertions as needed

    // Resolve the promise to complete the test
    await promise;
    jest.useRealTimers();
  });
});
