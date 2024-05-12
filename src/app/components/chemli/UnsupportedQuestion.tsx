import { useCallback } from "react";
import { Button } from "@blueprintjs/core";

import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function UnsupportedQuestion() {
    const dispatch = useReasonDemoDispatch();
    const onNext = useCallback(() => {
        const payload = {
            UnsupportedQuestion: 'Unsupported Question',
            transition: true,
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

    return (<div>
        <h1>Unsupported Question</h1>
        <p>This is not a supported queiton</p>
        <Button onClick={onNext}>
            Next
        </Button>
    </div>);

}