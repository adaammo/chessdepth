"use client"
import Image from "next/image"
export default function NotFound(){
    return (
        <div className = "min-h-[calc(100vh-55px)] min-w-screen flex justify-center items-center ">
            <div className = "min-h-[65dvh] max-w-[85dvw] flex flex-col items-center lg:flex-row lg:gap-2 lg:max-w-[40dvw] ">
            <Image
            alt = "404"
            src = "/404-logo.svg"
            height={500}
            width={500}
            className = "flex-1 max-w-[40dvh]"
            />
            <div className = "flex-1 flex flex-col items-center justify-centr">
            <h1 className = "text-4xl font-semibold text-center text-(--text-primary) lg:text-3xl">Page not found</h1>
            <span
            className = "text-lg text-center text-wrap font-semibold font-serif max-w-full text-(--text-secondary) lg:text-md"
            > 
            It seems you went to a page we cannot find ...
            </span>
            </div>  
            </div>
        </div>
    )
}