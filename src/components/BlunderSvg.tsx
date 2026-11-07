import Image from "next/image";

export default function BlunderSvg() {
    return (
        <Image
        alt = "Blunder Mark"
        src = "/blunder.svg"
        height = {250}
        width = {250}
        sizes = "800px"
        loading = "eager"
        />
        )
}