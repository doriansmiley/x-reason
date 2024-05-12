import { useCallback, useMemo } from "react";
import { Button } from "@blueprintjs/core";

import { useReasonDemoStore, useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";
import { FormulaTable } from ".";

export default function ExpertReview() {
    const { states, currentState, query, solution, context } = useReasonDemoStore();
    const dispatch = useReasonDemoDispatch();
    const onNext = useCallback(async (sampleRecalledSolution: string) => {
        const payload = {
            ExpertReview: 'TODO serialize the edited table',
        };

        dispatch({
            type: ReasonDemoActionTypes.SET_STATE,
            value: {
                event: {
                    type: "CONTINUE",
                    payload,
                },
            }
        });
    }, [dispatch]);

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

    const sampleRecalledSolution = JSON.parse(context?.RecallSolutions || {});

    const item = sampleRecalledSolution;
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
        <h1>Chemical Engineer Review</h1>
        <p>Please review the formula, make edits as required, and submit for lab testing. IMPORTANT: This is a notional example!</p>
        <div className="formula-container">
            <FormulaTable table={formula} className="formula-table" />
        </div>
        <p>
            Using the recalled solution will trigger a different path.
        </p>
        <Button onClick={() => onNext(sampleRecalledSolution)}>
            Submit
        </Button>
    </div>)
}