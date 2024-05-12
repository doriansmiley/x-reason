import { useCallback, useRef } from "react";
import { Button, TextArea, Intent } from "@blueprintjs/core";

import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function LabTesting() {
    const dispatch = useReasonDemoDispatch();
    const ref = useRef<TextArea>(null);

    const onNext = useCallback(() => {
        const payload = {
            LabTesting: ref.current?.textareaElement?.value || "Undefined",
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
        <h1>Lab Testing Results</h1>
        <p>Enter the results of lab testing.</p>
        <TextArea ref={ref} autoResize={true} intent={Intent.PRIMARY} large={true} />
        <Button onClick={onNext}>
            Next
        </Button>
    </div>);

}