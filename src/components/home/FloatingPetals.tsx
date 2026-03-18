import { useEffect, useRef } from "react";

type Petal = {
    x: number;
    y: number;
    size: number;
    speedY: number;
    speedX: number;
    rotation: number;
    rotationSpeed: number;
    opacity: number;
    color: string;
};

export default function FloatingPetals() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;

        const resize = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };

        resize();
        window.addEventListener("resize", resize);

        const colors = [
            "rgba(244, 194, 194, 0.6)",
            "rgba(255, 228, 225, 0.7)",
            "rgba(251, 207, 207, 0.5)",
            "rgba(253, 242, 242, 0.8)",
            "rgba(240, 210, 210, 0.6)",
        ];

        const petals: Petal[] = Array.from({ length: 25 }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height - canvas.height,
            size: Math.random() * 12 + 6,
            speedY: Math.random() * 0.8 + 0.3,
            speedX: (Math.random() - 0.5) * 0.4,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.02,
            opacity: Math.random() * 0.5 + 0.3,
            color: colors[Math.floor(Math.random() * colors.length)],
        }));

        const drawPetal = (ctx: CanvasRenderingContext2D, petal: Petal) => {
            ctx.save();
            ctx.translate(petal.x, petal.y);
            ctx.rotate(petal.rotation);
            ctx.globalAlpha = petal.opacity;
            ctx.fillStyle = petal.color;

            ctx.beginPath();
            ctx.ellipse(0, 0, petal.size / 2, petal.size, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            petals.forEach((petal) => {
                petal.y += petal.speedY;
                petal.x += petal.speedX + Math.sin(petal.y * 0.01) * 0.3;
                petal.rotation += petal.rotationSpeed;

                if (petal.y > canvas.height + 20) {
                    petal.y = -20;
                    petal.x = Math.random() * canvas.width;
                }

                drawPetal(ctx, petal);
            });

            animationId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
        />
    );
}