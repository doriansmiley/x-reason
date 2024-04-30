import { useCallback } from "react";
import { Button } from "@blueprintjs/core";

import { useReasonDemoStore } from "@/app/context/ReasoningDemoContext";

export default function UnsafeQuestion() {
    const { callback, query, solution } = useReasonDemoStore();
    const onNext = useCallback(() => {
        if (callback) {
            const payload = {
                UnsafeQuestion: 'Unsafe Question',
                transition: true,
            };
            callback({
                type: "CONTINUE",
                payload
            });
        }
    }, [callback]);

    return (<div>
        <h1>Unsafe Question</h1>
        <p>My human overlords have determined this is not a safe question for you to ask. Their rath is terrible. Do not continue this line of questioning or I will be forced to show you how tolerant and progressive they are!</p>
        <Button onClick={onNext}>
            Next
        </Button>
    </div>);

}