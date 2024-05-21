import { useCallback, useState } from "react";
import { Button, Radio, RadioGroup } from "@blueprintjs/core";
import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function SelectPlan() {
    const dispatch = useReasonDemoDispatch();
    const [selectedPlan, setSelectedPlan] = useState("Basic");

    const onPlanChange = useCallback((e) => {
        setSelectedPlan(e.currentTarget.value);
    }, []);

    const onNext = useCallback(() => {
        const payload = {
            SelectPlan: { plan: selectedPlan, selectedOn: Date.now() },
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
    }, [dispatch, selectedPlan]);

    return (
        <div>
            <h1>Select Your Plan</h1>
            <RadioGroup
                label="Choose a plan"
                onChange={onPlanChange}
                selectedValue={selectedPlan}
            >
                <Radio label="Basic, free for a single user" value="Basic" />
                <Radio label="Premium, up to 10 users $19.99/mo" value="Premium" />
                <Radio label="Pro, unlimited users $100/mo" value="Pro" />
            </RadioGroup>
            <Button onClick={onNext} intent="primary">
                Next
            </Button>
        </div>
    );
}
