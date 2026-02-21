import React from 'react';

interface LogoProps {
    className?: string;
    size?: number;
}

const Logo: React.FC<LogoProps> = ({ className, size = 48 }) => {
    return (
        <div className={`inline-flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            <svg width="100%" height="100%" viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Blue Background Pill */}
                <rect width="100" height="120" rx="35" fill="#1E88E5" />

                {/* Shield Shape */}
                <path
                    d="M50 30L25 40V65C25 80 50 90 50 90C50 90 75 80 75 65V40L50 30Z"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />

                {/* Cross (+) */}
                <path
                    d="M50 48V72M38 60H62"
                    stroke="white"
                    strokeWidth="5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </div>
    );
};

export default Logo;
