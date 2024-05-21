import { useCallback, useRef, useState } from "react";
import { Button, Checkbox } from "@blueprintjs/core";

import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function AcceptTOS() {
    const dispatch = useReasonDemoDispatch();
    const [checked, setChecked] = useState(false);

    function onChange() {
        setChecked(!checked);
    }

    const onNext = useCallback(() => {
        const payload = {
            AcceptTOS: { accepted: checked, acceptedOn: Date.now() },
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
    }, [dispatch, checked]);

    return (<div>
        <h1>Accept Terms of Service</h1>
        <Checkbox checked={checked} onChange={onChange}>Accept</Checkbox>
        <Button onClick={onNext}>
            Next
        </Button>
    </div>);

}