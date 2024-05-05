import { useCallback, useMemo } from "react";
import { Button } from "@blueprintjs/core";

import { engineV1 as engine } from "@/app/api/reasoning";
import { useReasonDemoStore } from "@/app/context/ReasoningDemoContext";
import { aiTransition } from "@/app/api/reasoning/prompts";
import { FormulaTable } from ".";

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
            const result = await engine.logic.transition(solution!, JSON.stringify(state), JSON.stringify(payload), aiTransition);

            callback({
                type: result,
                payload
            });
        }
    }, [callback, solution, currentState, states]);

    interface IPhaseStep {
        [key: string]: string;
    }

    interface IPhase {
        [key: string]: IPhaseStep[];
    }

    const migratePhasesToCSV = useCallback((phases: IPhase | undefined) => {
        if (phases === undefined) {
            return [["Sensible"], ["Default"]];
        }
        const csv: string[][] = [];
        const headers: string[] = [];
        const headersSet: Set<string> = new Set();

        Object.keys(phases).forEach((phase) => {
            const rows: IPhaseStep[] = phases[phase];

            rows.forEach((row) => {
                Object.keys(row).forEach((header) => {
                    if (!headersSet.has(header)) {
                        headers.push(header);
                        headersSet.add(header);
                    }
                });
            });
        });

        csv.push(headers);
        Object.keys(phases).forEach((phase) => {
            const rows: IPhaseStep[] = phases[phase];

            rows.forEach((row) => {
                const csvRow: string[] = [];
                headers.forEach((header: string) => {
                    csvRow.push(row[header] ? row[header] : "");
                });
                csvRow.push(phase);
                csv.push(csvRow);
            });
        });
        headers.push("phase");

        return csv;
    }, []);

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
"manufacturingProcedure": "1. Mix phase (A) and (B) separately and heat up to 80ºC. 2. Add phase (B) into (A) while stirring. 3. Start to cool down under medium stirring. Add phase (C) below 35ºC",
"claims": [
    "Skin is noticeable smoother because of the murumuru oil",
    "It is a non-greasy formulation which is enriched with natural oils and helps to improves the skin elasticity"
]
}
            
            `;

    const item = JSON.parse(sampleRecalledSolution);
    const phases = item.phases || item;
    const csv = migratePhasesToCSV(phases);
    const formula = {
        title: "Recalled Solution",
        table: csv,
        "Marketing Claims": phases.claims,
        "Manufacturing Procedure": phases.manufacturingProcedure,
        metadata: {},
    };

    return (<div>
        <h1>Review Retrieved Product</h1>
        <p>This is an example of how you can render components in response to state changes. In this example we are displaying a component that would allow the user to review a recalled chemical product for the query:</p>
        <pre>
            {query}
        </pre>
        <p>
            This is an example of a recalled formula. Its hard coded so it might not correspond to your query.
            Its just to demonstrate a more advanced UI
        </p>
        <div className="formula-container">
            <FormulaTable table={formula} className="formula-table" />
        </div>
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