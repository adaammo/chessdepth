import { AnimatePresence, easeInOut, motion } from "motion/react";
import { CheckCircle, CircleX } from "lucide-react"
import { useEffect, useState } from "react";
const TOAST_DURATION = 5000
export default function SuccessToast({ text, onClose }: { text: string, onClose: () => void }) {
    const [exit, setExit] = useState<boolean>(false);
    useEffect(() => {

        const timer = setTimeout(() => {
            onClose();
        }, TOAST_DURATION);

        return () => clearTimeout(timer)
    }, [onClose])
    return (
        <motion.div
            initial={{ opacity: 0, y: -40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: easeInOut }}
            exit={{ opacity: 0, y: -30 }}
            className="flex flex-row gap-1 items-center justify-center text-lg font-light  fixed top-10  left-1/2 -translate-x-1/2  w-[calc(100%-2rem)] text-wrap shrink-0  p-4  min-h-10 rounded-lg shadow-black shadow-sm lg:w-1/3 border border-(--border-default) bg-(--bg-primary) "
        >
                <CheckCircle size={18} strokeWidth={3} className="text-green-400" />
                <span>{text}</span>
        </motion.div>
    )
}