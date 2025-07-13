import React, { useEffect, useRef, useState } from 'react';
import './SpinWheel.css';

const SpinWheel = ({ items = [], spinning = false, onSpinComplete }) => {
    const canvasRef = useRef(null);
    const [rotation, setRotation] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);

    const colors = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
        '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
        '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA'
    ];

    useEffect(() => {
        drawWheel();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    useEffect(() => {
        if (spinning && !isAnimating) {
            startSpin();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [spinning, isAnimating]);

    const drawWheel = () => {
        const canvas = canvasRef.current;
        if (!canvas || items.length === 0) return;

        const ctx = canvas.getContext('2d');
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = Math.min(centerX, centerY) - 10;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const anglePerSegment = (2 * Math.PI) / items.length;

        // Draw segments
        items.forEach((item, index) => {
            const startAngle = index * anglePerSegment;
            const endAngle = startAngle + anglePerSegment;
            const color = colors[index % colors.length];

            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, startAngle, endAngle);
            ctx.closePath();
            ctx.fillStyle = color;
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();

            // Draw text
            ctx.save();
            ctx.translate(centerX, centerY);
            ctx.rotate(startAngle + anglePerSegment / 2);
            ctx.textAlign = 'center';
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 14px Arial';
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.shadowBlur = 2;
            
            // Adjust text position based on wheel size
            const textRadius = radius * 0.7;
            ctx.fillText(item.name, textRadius, 5);
            ctx.restore();
        });

        // Draw center circle
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30, 0, 2 * Math.PI);
        ctx.fillStyle = '#2c3e50';
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;
        ctx.stroke();

        // Draw pointer
        ctx.beginPath();
        ctx.moveTo(centerX + radius + 5, centerY);
        ctx.lineTo(centerX + radius - 15, centerY - 10);
        ctx.lineTo(centerX + radius - 15, centerY + 10);
        ctx.closePath();
        ctx.fillStyle = '#e74c3c';
        ctx.fill();
        ctx.strokeStyle = '#c0392b';
        ctx.lineWidth = 2;
        ctx.stroke();
    };

    const startSpin = () => {
        if (isAnimating) return;
        
        setIsAnimating(true);
        const spins = 5 + Math.random() * 5; // 5-10 vòng quay
        const finalRotation = rotation + (spins * 360) + Math.random() * 360;
        
        setRotation(finalRotation);
        
        // Animation complete after 3 seconds
        setTimeout(() => {
            setIsAnimating(false);
            if (onSpinComplete) {
                onSpinComplete();
            }
        }, 3000);
    };

    if (items.length === 0) {
        return (
            <div className="spin-wheel-placeholder">
                <div className="loading-message">
                    Đang tải vòng quay...
                </div>
            </div>
        );
    }

    return (
        <div className="spin-wheel">
            <div 
                className={`wheel-container ${isAnimating ? 'spinning' : ''}`}
                style={{ 
                    transform: `rotate(${rotation}deg)`,
                    transition: isAnimating ? 'transform 3s cubic-bezier(0.23, 1, 0.32, 1)' : 'none'
                }}
            >
                <canvas
                    ref={canvasRef}
                    width={300}
                    height={300}
                    className="wheel-canvas"
                />
            </div>
        </div>
    );
};

export default SpinWheel;
