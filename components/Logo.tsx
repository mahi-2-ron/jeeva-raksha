import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

const Logo: React.FC<LogoProps> = ({ className, size = 40 }) => {
    return (
        <div className={`inline-flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 p-2 ${className}`} style={{ width: size, height: size }}>
            <svg width="100%" height="100%" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M32 4L8 14V30C8 44.8 18.24 58.56 32 60C45.76 58.56 56 44.8 56 30V14L32 4Z" fill="#0891b2" />
                <circle cx="32" cy="32" r="20" fill="white" />
                <path d="M18 32H24L28 22L36 42L40 32H46" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
        </div>
    );
};

export default Logo;
