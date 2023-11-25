import { MouseEventHandler } from "react";

export default function SpecialOffers({ onClick }: {onClick: MouseEventHandler<HTMLButtonElement>}) {
    return(
        <div>
            <h1>SpecialOffers</h1>
            <button onClick={onClick}>Next</button>
        </div>
    );
}