import { useCallback, useRef, useState } from "react";
import { Button, Checkbox } from "@blueprintjs/core";

import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function AgeConfirmation() {
    const dispatch = useReasonDemoDispatch();
    const [checked, setChecked] = useState(false);

    function onChange() {
        setChecked(!checked);
    }

    const onNext = useCallback(() => {
        const payload = {
            AgeConfirmation: { confirmed: checked, confirmedOn: Date.now() },
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
        <h1>Confirm Your Age</h1>
        <Checkbox checked={checked} onChange={onChange}>I am at least 18 years of age</Checkbox>
        <Button onClick={onNext}>
            Next
        </Button>
    </div>);

}