import { State } from 'xstate';

import { headlessInterpreter } from '.';
import { MachineEvent, Context, StateConfig, Task } from '.';
import { ReasonDemoActionTypes } from '@/app/context/ReasoningDemoContext';

describe('headlessInterpreter', () => {
    const mockDispatch = jest.fn();

    const mockTask: Task = {
        description: 'Mock Task',
        implementation: (context: Context, event?: MachineEvent) => {
            context.status = 1;
        },
    };

    const mockStates: StateConfig[] = [
        {
            id: 'initial',
            transitions: [{ on: 'NEXT', target: 'nextState' }],
        },
        {
            id: 'nextState',
            type: 'final',
        },
    ];

    const mockFunctions = new Map<string, Task>([
        ['mockTask', mockTask],
    ]);

    beforeEach(() => {
        mockDispatch.mockClear();
    });

    it('should initialize and transition states correctly', () => {
        const { done, stop, send } = headlessInterpreter(mockStates, mockFunctions, mockDispatch);

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: ReasonDemoActionTypes.SET_STATE,
            value: expect.objectContaining({
                currentState: expect.any(Object),
                context: expect.objectContaining({
                    requestId: 'test',
                    status: 0,
                    stack: [],
                }),
            }),
        });

        expect(done()).toBe(false);

        // Simulate the transition
        const currentState = mockDispatch.mock.calls[0][0].value.currentState;

        send({ type: 'RESUME_EXECUTION' });

        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: ReasonDemoActionTypes.SET_STATE,
            value: expect.objectContaining({
                currentState: expect.any(Object),
                context: expect.objectContaining({
                    requestId: 'test',
                    status: 1,
                    stack: [],
                }),
            }),
        });

        expect(done()).toBe(true);

        stop();
    });

    it('should hydrate from the serialized state', () => {
        const { serialize, stop } = headlessInterpreter(mockStates, mockFunctions, mockDispatch);

        const currentState = mockDispatch.mock.calls[0][0].value.currentState;
        const serializedState = serialize(currentState);

        stop();

        const { done, serialize: serializeNew, stop: stopNew } = headlessInterpreter(
            mockStates,
            mockFunctions,
            mockDispatch,
            undefined,
            State.create(JSON.parse(serializedState))
        );

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: ReasonDemoActionTypes.SET_STATE,
            value: expect.objectContaining({
                currentState: expect.any(Object),
                context: expect.objectContaining({
                    requestId: 'test',
                    status: 1,
                    stack: [],
                }),
            }),
        });

        expect(done()).toBe(true);

        stopNew();
    });
});
