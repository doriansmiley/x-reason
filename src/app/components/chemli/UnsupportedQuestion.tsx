import { useCallback } from "react";
import { Button } from "@blueprintjs/core";

import { useReasonDemoStore } from "@/app/context/ReasoningDemoContext";

export default function UnsupportedQuestion() {
    const { callback, query, solution } = useReasonDemoStore();
    const onNext = useCallback(() => {
        if (callback) {
            const payload = {
                UnsupportedQuestion: 'Unsupported Question',
                transition: true,
            };
            callback({
                type: "CONTINUE",
                payload
            });
        }
    }, [callback]);

    return (<div>
        <h1>Unsupported Question</h1>
        <p>This is not a supported queiton</p>
        <Button onClick={onNext}>
            Next
        </Button>
    </div>);

}