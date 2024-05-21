import { useCallback, useRef, useState } from "react";
import { Button, Checkbox } from "@blueprintjs/core";

import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function PartnerPlugins() {
    const dispatch = useReasonDemoDispatch();
    const [checked, setChecked] = useState(false);

    function onChange() {
        setChecked(!checked);
    }

    const onNext = useCallback(() => {
        const payload = {
            PartnerPlugins: { newsletterConfirmed: checked, confirmedOn: Date.now() },
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
        <Checkbox checked={checked} onChange={onChange}>Sign up for the X-Reason Newsletter</Checkbox>
        <Button onClick={onNext}>
            Next
        </Button>
    </div>);

}