import { MouseEventHandler } from "react";

export default function Error({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>Error</h1>
            <button onClick={onClick}></button>
        </div>
    );
}