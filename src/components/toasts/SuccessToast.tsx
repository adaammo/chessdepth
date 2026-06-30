import { AnimatePresence, easeInOut, motion } from "motion/react";
import { CheckCircle } from "lucide-react"
import { useEffect, useState } from "react";
const TOAST_DURATION = 10000
export default function SuccessToast({text, onClose} : {text: string, onClose: () => void}){
    const [exit, setExit] = useState<boolean>(false);
    useEffect(() => {

        const timer = setTimeout(() => {
          onClose();
        }, TOAST_DURATION);
    
        return () => clearTimeout(timer)
    },[onClose])
    return (
            <motion.div
            initial = {{opacity: 0, y: -40}}
            animate = {{opacity: 1, y: 0}}
            transition = {{duration: 0.2, ease: easeInOut}}
            exit = {{opacity: 0, y: -30}}
            className = "flex flex-row gap-1 items-center justify-start text-xl font-bold fixed top-10  left-1/2 -translate-x-1/2  w-1/2 p-2  min-h-10 rounded-lg shaodw-black shadow-md lg:w-1/3 border border-(--border-subtle) bg-(--bg-tertiary) "
            >
                <CheckCircle size = {18} strokeWidth={3} className = "text-green-400"/>
               {text}
               <span className = "self-end">
                x
               </span>
            </motion.div>
    )
}