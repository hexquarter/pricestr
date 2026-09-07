export const SectionHeader: React.FC<{  title: string }> = ({ title }) => {
    return (
        <div className="flex justify-between text-[10px] text-primary uppercase font-mono tracking-widest border-b border-t border-border/10 py-2 items-center gap-5">
            <div className="flex gap-5 ">
                <span className="">// {title}</span>
            </div>
        </div>
    )
}