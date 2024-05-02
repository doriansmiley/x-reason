import { MouseEventHandler } from "react";

export default function SelectPlan({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>SelectPlan</h1>
            <button onClick={onClick}>Next</button>
        </div>
    );
}