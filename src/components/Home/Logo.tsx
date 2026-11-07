import Image from "next/image";

export type LogoProps = {
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'middle'|'xl';
    src?: string
}
export default function Logo({size = "sm", src = "/main-logo-chessdepth.svg"}: LogoProps){
    const sizes = {
        xs:     { width: 30,  height: 27  },
        sm:     { width: 40,  height: 36  },
        md:     { width: 60,  height: 54  },
        middle: { width: 80,  height: 72  },
        lg:     { width: 110, height: 100 },
        xl:     { width: 160, height: 145 },
      };
      const {width, height} = sizes[size];
      return(
        <Image
        alt = "chess-depth-logo"
        src = {src}
        height = {height}
        width = {width}
        priority
        sizes = "800px"
        />
      )
}