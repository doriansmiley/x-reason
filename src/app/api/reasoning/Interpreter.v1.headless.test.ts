import { State } from 'xstate';

import { headlessInterpreter } from '.';
import { MachineEvent, Context, StateConfig, Task } from '.';
import { ReasonDemoActionTypes } from '@/app/context/ReasoningDemoContext';

describe('headlessInterpreter', () => {
    const mockDispatch = jest.fn();

    const mockStates: StateConfig[] = [
        {
            id: 'mockTask',
            transitions: [{ on: 'CONTINUE', target: 'nextState' }],
        },
        {
            id: 'nextState',
            transitions: [{ on: 'CONTINUE', target: 'success' }],
        },
        {
            id: 'success',
            type: 'final'
        },
        {
            id: 'failure',
            type: 'final'
        }
    ];

    const mockFunctions = new Map<string, Task>([
        [
            'mockTask',
            {
                description:
                    'mockTask',
                // this is an example of a visual state that requires user interaction
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('mockTask implementation called');
                },
            },
        ],
        [
            'nextState',
            {
                description:
                    'nextState',
                // this is an example of a visual state that requires user interaction
                implementation: (context: Context, event?: MachineEvent) => {
                    console.log('nextState implementation called');
                },
            },
        ],
    ]);

    beforeEach(() => {
        mockDispatch.mockClear();
    });

    it('should initialize and transition states correctly', () => {
        const { done, start, send } = headlessInterpreter(mockStates, mockFunctions, mockDispatch);

        start();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_STATE',
            value: expect.objectContaining({
                currentState: expect.objectContaining({
                    value: 'mockTask',
                    context: {
                        requestId: 'test',
                        status: 0,
                        stack: ['mockTask'],
                    },
                }),
            }),
        });

        expect(done()).toBe(false);
        // Simulate the transition
        send({ type: 'CONTINUE' });

        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_STATE',
            value: expect.objectContaining({
                currentState: expect.objectContaining({
                    'value': 'nextState',
                }),
                context: expect.objectContaining({
                    requestId: 'test',
                    status: 0,
                    stack: ['mockTask', 'nextState'],
                }),
            }),
        });

        send({ type: 'CONTINUE' });

        expect(done()).toBe(true);

    });

    it('should hydrate from the serialized state', () => {
        const { serialize, stop, start } = headlessInterpreter(mockStates, mockFunctions, mockDispatch);

        start();

        const currentState = mockDispatch.mock.calls[0][0].value.currentState;
        const serializedState = serialize(currentState);

        stop();

        mockDispatch.mockClear();

        const { done, serialize: serializeNew, stop: stopNew, send, start: startNew } = headlessInterpreter(
            mockStates,
            mockFunctions,
            mockDispatch,
            undefined,
            State.create(JSON.parse(serializedState))
        );

        startNew();

        expect(mockDispatch).toHaveBeenCalledTimes(1);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_STATE',
            value: expect.objectContaining({
                currentState: expect.objectContaining({
                    'value': 'mockTask',
                }),
                context: expect.objectContaining({
                    requestId: 'test',
                    status: 0,
                    stack: ['mockTask'],
                }),
            }),
        });

        // Simulate the transition
        send({ type: 'CONTINUE' });

        expect(mockDispatch).toHaveBeenCalledTimes(2);
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_STATE',
            value: expect.objectContaining({
                currentState: expect.objectContaining({
                    value: 'nextState',
                    context: {
                        requestId: 'test',
                        status: 0,
                        stack: ['mockTask', 'nextState'],
                    },
                }),
            }),
        });

        send({ type: 'CONTINUE' });

        expect(done()).toBe(true);

        stopNew();
    });
});
