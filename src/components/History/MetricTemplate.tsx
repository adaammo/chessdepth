type MetricProps = {
    label: string;
    value: string | number;
    detail?: string;
    icon?: React.ElementType;
    rating?: boolean;
    className?: string;
};
export default function MetricTemplate({
    label,
    value,
    detail,
    icon: Icon,
    rating = false,
    className = "",
}: MetricProps) {
    return (
        <div
            className={`flex min-h-24 min-w-0 flex-col items-center justify-center gap-1 px-3 py-4 text-center ${className}`}
        >
            <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-(--text-muted)">
                {Icon && <Icon size={15} strokeWidth={1.7} />}
                {label}
            </div>

            <div className="flex min-w-0 items-baseline justify-center gap-2">
                <span
                    className={`truncate font-semibold ${rating
                            ? "text-xl text-(--accent)"
                            : "text-lg text-(--text-primary)"
                        }`}
                >
                    {value}
                </span>

                {detail && (
                    <span className="shrink-0 text-xs text-(--text-muted)">
                        {detail}
                    </span>
                )}
            </div>
        </div>
    );
}