"use client";

import clsx from "clsx";

type ButtonVariant = "primary" | "secondary" | "danger";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
}

export default function Button({
    variant = "primary",
    className,
    ...props
}: ButtonProps) {
    return (
        <button
            {...props}
            className={clsx(
                "px-4 py-2 rounded-md text-sm font-medium transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-offset-2",
                {
                    // Primary – ESZFK kék
                    "bg-blue-700 text-white hover:bg-blue-800 focus:ring-blue-600":
                        variant === "primary",

                    // Secondary
                    "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100 focus:ring-gray-400":
                        variant === "secondary",

                    // Danger
                    "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500":
                        variant === "danger",
                },
                "disabled:opacity-50 disabled:cursor-not-allowed",
                className
            )}
        />
    );
}

