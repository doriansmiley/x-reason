import { useCallback } from "react";
import { Button } from "@blueprintjs/core";

import { engineV2 as engine } from "@/app/api/reasoning";
import { useReasonDemoStore } from "@/app/context/ReasoningDemoContext";

export default function RecallSolution() {
    const { states, currentState, callback, query, solution } = useReasonDemoStore();
    const onNext = useCallback(async (sampleRecalledSolution: string) => {
        if (callback) {
            const payload = {
                RecallSolutions: sampleRecalledSolution,
            };
            // this is an example of a non deterministic function that is invoked as part of evaluating transitions
            // it uses the default LLM reasoning function included as part of the engine.logic.transition function
            // This is just an example of how to use LLMs to reason about transition logic
            const state = states?.find((item) => item.id === currentState);
            const result = await engine.logic.transition(solution!, JSON.stringify(state), JSON.stringify(payload));

            callback({
                type: result,
                payload
            });
        }
    }, [callback, solution, currentState, states]);
    const sampleRecalledSolution = `
            {"phases": {
    "A": [
        {
            "ingredient": "water",
            "INCI Name": "Aqua",
            "%": "Up to 100%"
        },
        {
            "ingredient": "Beraclay Crude",
            "INCI Name": "Kaolin",
            "%": "2%"
        },
        {
            "ingredient": "Glycerin",
            "INCI Name": "Glycerin",
            "%": "4%"
        }
    ],
    "B": [
        {
            "ingredient": "Murumuru Butter Refined",
            "INCI Name": "Astrocaryum murumuru seed butter, Tocopherol",
            "%": "12%"
        },
        {
            "ingredient": "Babucu Oil Refined",
            "INCI Name": "Orbignya oleifera seed oil, Tocopherol",
            "%": "3.50%"
        },
        {
            "ingredient": "Oliwax LC",
            "INCI Name": "Cetyl Palmitate (and) Sorbitan Palmitate (and) Sorbitan Olivate",
            "%": "10%"
        }
    ],
    "C": [
        {
            "ingredient": "Nipuguard SCA",
            "INCI Name": "Sorbitan Caprylate (and) Benzyl Alcohol",
            "%": "1.50%"
        },
        {
            "ingredient": "Fragrance",
            "INCI Name": "Fragrance",
            "%": "0.20%"
        }
    ]
},
"Manufacturing Procedure": "1. Mix phase (A) and (B) separately and heat up to 80ºC. 2. Add phase (B) into (A) while stirring. 3. Start to cool down under medium stirring. Add phase (C) below 35ºC",
"Claims": [
    "Skin is noticeable smoother because of the murumuru oil",
    "It is a non-greasy formulation which is enriched with natural oils and helps to improves the skin elasticity"
]
}
            
            `;

    return (<div>
        <h1>Review Retrieved Product</h1>
        <p>This is an example of how you can render components in response to state changes. In this example we are displaying a component that would allow the user to review a recalled chemical product for the query:</p>
        <pre>
            {query}
        </pre>
        <p>
            Clicking this button simulates a recalled solution being found.
            <Button onClick={() => onNext(sampleRecalledSolution)}>
                Next
            </Button>
        </p>
        <p>
            Clicking this button simulates a recalled solution NOT being found.
            <Button onClick={() => onNext('No solution found')}>
                Next
            </Button>
        </p>
    </div>)
}