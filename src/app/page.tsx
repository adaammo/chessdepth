"use client"
import { AnimatePresence, motion } from "motion/react";
import { useState, useTransition } from "react";
import { PostChessUsername } from "../lib/api/analyze";
import SuccessToast from "../components/toasts/SuccessToast";
export default function Home() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState<boolean>(false)
  return (
    <div className="relative flex min-h-screen min-w-screen flex-col items-center justify-center overflow-hidden px-6">
      <motion.div
        animate={{ opacity: [0.12, 0.22, 0.12] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-175 w-175 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background:
            "radial-gradient(circle, var(--accent) 0%, transparent 60%)",
        }}
      />
      <AnimatePresence>
    {success && (
      <SuccessToast text = {"hi"} onClose = {() => setSuccess(false)}/>
    )}
    </AnimatePresence>

      <div className="relative z-10 flex w-full max-w-xl flex-col items-center justify-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-balance text-5xl font-black leading-tight tracking-tight text-(--text-primary) md:text-6xl">
            Know your opening accuracy.
          </h1>

          <p className="max-w-lg text-base leading-7 text-(--text-secondary)">
            Analyze your Chess.com games to find your strongest openings, weakest
            lines, and where you struggled.
          </p>
        </div>

        <form
          onSubmit={(e) => {
            startTransition(async () => {
              setError("")
              e.preventDefault();
              e.stopPropagation();

              const formData = new FormData(e.currentTarget);
              const { username } = Object.fromEntries(formData.entries());
              const res = await PostChessUsername(username as string);
              if(!res?.ok){
                return setError(res.msg)
              }
              return setSuccess(true);
            })
          }}
          className="flex w-full flex-col gap-4 rounded-3xl border border-(--border-default) bg-(--bg-secondary)/80 p-5 text-left shadow-2xl shadow-black/20 backdrop-blur">
          <div className="flex flex-col gap-2">
            <label className="font-bold text-(--text-primary)">
              Chess.com username
            </label>

            <input
              placeholder="e.g. MagnesCarlsen"
              name="username"
              className="rounded-xl border border-(--border-default) bg-(--bg-primary) px-4 py-3 text-(--text-primary) shadow-sm shadow-black outline-none transition placeholder:text-(--text-muted) focus:border-(--accent) focus:ring-4 focus:ring-(--accent)/10"
            />
            {error && (
              <span className = "text-red-400 font-medium text-md">
                {error}
              </span>
            )}
          </div>

          <button 
          type = "submit"
          className="w-full cursor-pointer rounded-xl border border-(--border-default) bg-(--button-primary-bg) py-3 font-bold text-black transition duration-300 hover:opacity-80">
           {isPending ? (
            <span className = "loading loading-lg loading-dots"/>
           ) : (
            "Analyze Opening"
           )}
          </button>

          <p className="text-center text-xs text-(--text-muted)">
            No login required. We use public Chess.com game data using their PubAPI
          </p>
        </form>
      </div>
    </div>
  );
}
