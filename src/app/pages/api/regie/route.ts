import { type NextRequest } from 'next/server';
import { headers } from 'next/headers'

import {
    regieProgrammer,
    regieSolver,
    regieEvaluate,
    regieFunctionCatalog,
    regieToolsCatalog,
    regieMetaData,
} from './context';
import { headlessInterpreter } from '@/app/api/reasoning';
import { engineV1 as engine } from "@/app/api/reasoning";

type ActionType = {
    type: string;
    value?: Record<string, unknown>;
    payload?: Record<string, unknown>;
};

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('query');

    if (!query) {
        return Response.json({ response: 'Bad Request' }, {
            status: 400,
        });
    }

    const dispatch = (action: ActionType) => {
        console.log(`route dispatch callback called`);
    };
    const sendProxy = (action: ActionType) => {
        send(action);
    };
    const functions = regieFunctionCatalog(sendProxy);
    const toolsCatalog = regieToolsCatalog();

    const solverSolution = await engine.solver.solve(query, regieSolver);
    // generate the program
    const result = await engine.programmer.program(solverSolution, JSON.stringify(Array.from(toolsCatalog.entries())), regieProgrammer);
    const evaluationResult = await engine.evaluator.evaluate({ query: `${solverSolution}\n${result}`, states: result, tools: functions }, regieEvaluate)
    if (!evaluationResult.correct) {
        // TODO, use the revised solutions provided by the evaluator once that functionality has been added
        throw evaluationResult.error || new Error('The provided solution failed evaluation');
    }

    const { done, start, send, getContext } = headlessInterpreter(result, functions, dispatch);

    try {
        console.log('calling start');
        start();

        let iterations = 0;
        // this effectively acts as a timeout. Be sure to adjust if you have long running functions in your states!
        const MAX_ITERATIONS = 30;
        while (!done() && iterations < MAX_ITERATIONS) {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log('awaiting results');
            iterations++;
        }

        if (iterations >= MAX_ITERATIONS) {
            console.warn('Exceeded maximum iterations while awaiting results.');
        }

        return Response.json({
            response: {
                query,
                result,
                evaluationResult,
                context: getContext(),
            }
        });
    } catch (e) {
        console.log((e as Error).message);
        console.log((e as Error).stack);
        return Response.json({ response: 'Internal Server Error' }, {
            status: 500,
        });
    }

}