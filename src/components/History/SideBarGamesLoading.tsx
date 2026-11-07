export default function SideBarGamesLoading(){
    return(
        <div
        className="min-h-80 "
        aria-busy="true"
        aria-label="Loading games"
    >
        {Array.from({ length: 20 }).map((_, index) => (
            <div
                key={index}
                className="flex items-center justify-between gap-4 px-4 py-5 animate-pulse"
            >
                <div className="min-w-0 flex-1">
                    <div className="mb-3 flex items-center gap-2">
                        <div className="h-4 w-28 rounded bg-white/10" />
                        <div className="h-4 w-4 rounded bg-white/5" />
                        <div className="h-4 w-24 rounded bg-white/10" />
                    </div>

                    <div className="flex gap-3">
                        <div className="h-3 w-20 rounded bg-white/5" />
                        <div className="h-3 w-14 rounded bg-white/5" />
                    </div>
                </div>

                <div className="h-7 w-14 rounded-md bg-white/10" />
            </div>
        ))}
    </div>
    )
}