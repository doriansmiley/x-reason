import { MouseEventHandler } from "react";

export default function PartnerPlugins({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>PartnerPlugins</h1>
            <button onClick={onClick}>Next</button>
        </div>
    );
}