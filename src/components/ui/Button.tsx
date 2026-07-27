import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "primary-soft"
    | "secondary"
    | "danger"
    | "danger-ghost"
    | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  className = "",
  variant = "primary",
  size = "md",
  ...props
}) => {
  const baseClasses =
    "font-medium rounded-lg border focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

  const variantClasses = {
    primary:
      "text-white bg-background-ui border-background-ui hover:bg-background-ui/80 hover:border-background-ui/80 focus:ring-1 focus:ring-background-ui",
    "primary-soft":
      "text-text bg-logo-primary/20 border-transparent hover:bg-logo-primary/30 focus:ring-1 focus:ring-logo-primary",
    secondary:
      "bg-mid-gray/10 border-mid-gray/20 hover:bg-background-ui/30 hover:border-logo-primary focus:outline-none",
    danger:
      "text-white bg-danger border-mid-gray/20 hover:bg-danger hover:border-danger focus:ring-1 focus:ring-danger",
    "danger-ghost":
      "text-danger border-transparent hover:text-danger hover:bg-danger/10 focus:bg-danger/20",
    ghost:
      "text-current border-transparent hover:bg-mid-gray/10 hover:border-logo-primary focus:bg-mid-gray/20",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-4 py-[5px] text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
