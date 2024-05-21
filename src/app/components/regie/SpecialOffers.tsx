import { useCallback, useState } from "react";
import { Button, Radio, RadioGroup } from "@blueprintjs/core";
import { useReasonDemoDispatch, ReasonDemoActionTypes } from "@/app/context/ReasoningDemoContext";

export default function SpecialOffers() {
    const dispatch = useReasonDemoDispatch();
    const [selectedOffer, setSelectedOffer] = useState("Prepay 6 months and get 10% off");

    const onOfferChange = useCallback((e) => {
        setSelectedOffer(e.currentTarget.value);
    }, []);

    const onNext = useCallback(() => {
        const payload = {
            SpecialOffers: { offer: selectedOffer, selectedOn: Date.now() },
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
    }, [dispatch, selectedOffer]);

    return (
        <div>
            <h1>Select a Special Offer</h1>
            <RadioGroup
                label="Choose an offer"
                onChange={onOfferChange}
                selectedValue={selectedOffer}
            >
                <Radio label="Prepay 6 months and get 10% off" value="Prepay 6 months and get 10% off" />
                <Radio label="Prepay one year and get 10% off" value="Prepay one year and get 10% off" />
            </RadioGroup>
            <Button onClick={onNext} intent="primary">
                Next
            </Button>
        </div>
    );
}
