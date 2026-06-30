import Image from "next/image";
type LogoProps = {
src?: string, 
size?: "xs" | "sm" | "md" | "middle" | "lg" | "xl"
}
export default function Logo({src = "/chess-web-logo.svg", size = "md"} : LogoProps){
    const dimensions = {
        xs:     { width: 30,  height: 27  },
        sm:     { width: 40,  height: 36  },
        md:     { width: 60,  height: 54  },
        middle: { width: 80,  height: 72  },
        lg:     { width: 110, height: 100 },
        xl:     { width: 250, height: 170 },
      };
    const {width, height } = dimensions[size];
    return(
        <Image
        src = {src}
        alt = "Logo"
        width = {width}
        height = {height}
        sizes = "1000"
        quality={100}
        priority
        />
    )
}