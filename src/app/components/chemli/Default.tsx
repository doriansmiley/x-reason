import { Intent, Spinner, SpinnerSize } from "@blueprintjs/core";

export default function DefaultComponent({ message }: { message: string }) {
    return (
        <div>
            <Spinner aria-label="Loading..." intent={Intent.PRIMARY} size={SpinnerSize.STANDARD} />
            <p>{message}</p>
        </div>
    );
}