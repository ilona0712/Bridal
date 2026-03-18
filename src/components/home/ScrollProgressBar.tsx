import { useEffect, useState } from "react";

export default function ScrollProgressBar() {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const total = document.documentElement.scrollHeight - window.innerHeight;
            const current = window.scrollY;
            setProgress(total > 0 ? (current / total) * 100 : 0);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <div className="fixed top-0 left-0 w-full h-[2px] z-[9998] bg-transparent">
            <div
                className="h-full bg-gradient-to-r from-pink-200 via-pink-300 to-stone-300 transition-all duration-75"
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}