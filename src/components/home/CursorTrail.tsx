import { useEffect, useRef, useState } from "react";

type TrailPoint = {
    x: number;
    y: number;
    size: number;
    opacity: number;
    rotation: number;
    color: string;
    vx: number;
    vy: number;
};

export default function CursorTrail() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const points = useRef<TrailPoint[]>([]);
    const animationId = useRef<number>(0);
    const mouse = useRef({ x: -100, y: -100 });
    const ring = useRef({ x: -100, y: -100 });
    const [pos, setPos] = useState({ x: -100, y: -100 });
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        // Hide default cursor
        document.body.style.cursor = "none";
        return () => {
            document.body.style.cursor = "auto";
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener("resize", resize);

        const colors = [
            "rgba(244, 194, 194, 0.9)",
            "rgba(255, 182, 193, 0.8)",
            "rgba(251, 207, 207, 0.9)",
            "rgba(255, 228, 225, 0.7)",
            "rgba(252, 220, 220, 0.85)",
        ];

        const drawPetal = (
            ctx: CanvasRenderingContext2D,
            x: number,
            y: number,
            size: number,
            rotation: number,
            color: string,
            opacity: number
        ) => {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(rotation);
            ctx.globalAlpha = opacity;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.ellipse(0, 0, size / 2.5, size, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const onMouseMove = (e: MouseEvent) => {
            mouse.current = { x: e.clientX, y: e.clientY };
            setPos({ x: e.clientX, y: e.clientY });
            setVisible(true);

            for (let i = 0; i < 2; i++) {
                points.current.push({
                    x: e.clientX + (Math.random() - 0.5) * 10,
                    y: e.clientY + (Math.random() - 0.5) * 10,
                    size: Math.random() * 10 + 4,
                    opacity: Math.random() * 0.6 + 0.4,
                    rotation: Math.random() * Math.PI * 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    vx: (Math.random() - 0.5) * 1.5,
                    vy: Math.random() * -1.5 - 0.5,
                });
            }

            if (points.current.length > 120) {
                points.current = points.current.slice(-120);
            }
        };

        const onMouseLeave = () => setVisible(false);
        const onMouseEnter = () => setVisible(true);

        window.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseleave", onMouseLeave);
        document.addEventListener("mouseenter", onMouseEnter);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Smooth ring lag
            ring.current.x += (mouse.current.x - ring.current.x) * 0.12;
            ring.current.y += (mouse.current.y - ring.current.y) * 0.12;

            // Draw lagging ring
            ctx.save();
            ctx.globalAlpha = 0.5;
            ctx.strokeStyle = "rgba(244, 194, 194, 0.8)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(ring.current.x, ring.current.y, 20, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();

            // Draw petals
            points.current = points.current.filter((p) => p.opacity > 0.01);
            points.current.forEach((p) => {
                drawPetal(ctx, p.x, p.y, p.size, p.rotation, p.color, p.opacity);
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.04;
                p.rotation += 0.03;
                p.opacity *= 0.94;
                p.size *= 0.98;
            });

            animationId.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId.current);
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("resize", resize);
            document.removeEventListener("mouseleave", onMouseLeave);
            document.removeEventListener("mouseenter", onMouseEnter);
        };
    }, []);

    return (
        <>
            <canvas
                ref={canvasRef}
                className="fixed inset-0 pointer-events-none z-[9999]"
            />
            {/* Dot */}
            {visible && (
                <div
                    className="fixed pointer-events-none z-[9999] select-none"
                    style={{
                        left: pos.x - 10,
                        top: pos.y - 10,
                        filter: "drop-shadow(0 1px 4px rgba(244,194,194,0.6))",
                    }}
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 100 100"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* Stem */}
                        <line x1="50" y1="70" x2="50" y2="100" stroke="#a8836a" strokeWidth="4" strokeLinecap="round" />
                        {/* Leaf */}
                        <path d="M50 85 Q35 75 38 65 Q45 72 50 85Z" fill="#c4a882" opacity="0.8" />
                        {/* Outer petals */}
                        <ellipse cx="50" cy="52" rx="10" ry="18" fill="#f0c4c4" opacity="0.7" transform="rotate(0 50 50)" />
                        <ellipse cx="50" cy="52" rx="10" ry="18" fill="#f0c4c4" opacity="0.7" transform="rotate(60 50 50)" />
                        <ellipse cx="50" cy="52" rx="10" ry="18" fill="#f0c4c4" opacity="0.7" transform="rotate(120 50 50)" />
                        <ellipse cx="50" cy="52" rx="10" ry="18" fill="#edb8b8" opacity="0.7" transform="rotate(180 50 50)" />
                        <ellipse cx="50" cy="52" rx="10" ry="18" fill="#edb8b8" opacity="0.7" transform="rotate(240 50 50)" />
                        <ellipse cx="50" cy="52" rx="10" ry="18" fill="#edb8b8" opacity="0.7" transform="rotate(300 50 50)" />
                        {/* Inner petals */}
                        <ellipse cx="50" cy="46" rx="7" ry="12" fill="#e8a8a8" opacity="0.85" transform="rotate(30 50 50)" />
                        <ellipse cx="50" cy="46" rx="7" ry="12" fill="#e8a8a8" opacity="0.85" transform="rotate(90 50 50)" />
                        <ellipse cx="50" cy="46" rx="7" ry="12" fill="#e8a8a8" opacity="0.85" transform="rotate(150 50 50)" />
                        <ellipse cx="50" cy="46" rx="7" ry="12" fill="#dfa0a0" opacity="0.85" transform="rotate(210 50 50)" />
                        <ellipse cx="50" cy="46" rx="7" ry="12" fill="#dfa0a0" opacity="0.85" transform="rotate(270 50 50)" />
                        <ellipse cx="50" cy="46" rx="7" ry="12" fill="#dfa0a0" opacity="0.85" transform="rotate(330 50 50)" />
                        {/* Center */}
                        <circle cx="50" cy="50" r="8" fill="#d4888888" />
                        <circle cx="50" cy="50" r="5" fill="#c87878" opacity="0.9" />
                    </svg>
                </div>
            )}
        </>
    );
}