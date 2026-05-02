import * as React from "react"
import { Mail, Lock, User, Search, Phone } from "lucide-react"

import { cn } from "@/lib/utils"
import { on } from "events";

interface InputProps extends React.ComponentProps<"input"> {
    label?: string;
    icon?: React.ReactNode;
    focusHandler?: (e: React.FocusEvent<HTMLInputElement>) => void;
    blurHandler?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, label, icon, focusHandler, blurHandler, ...props }, ref) => {
        const [isFocused, setIsFocused] = React.useState(false);
        const [hasValue, setHasValue] = React.useState(false);

        const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(true);
            props.onFocus?.(e);
            focusHandler?.(e);
        };

        const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
            setIsFocused(false);
            setHasValue(e.target.value.length > 0);
            props.onBlur?.(e);
            blurHandler?.(e);
        };

        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setHasValue(e.target.value.length > 0);
            props.onChange?.(e);
        };

        const isLabelFloating = isFocused || hasValue;
        const hasIcon = !!icon;

        if (!label && !icon) {
            return (
                <input
                    ref={ref}
                    type={type}
                    data-slot="input"
                    className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        className
                    )}
                    {...props}
                />
            );
        }

        return (
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
                        {icon}
                    </div>
                )}
                <input
                    ref={ref}
                    type={type}
                    data-slot="input"
                    className={cn(
                        "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-black/30 h-12 w-full min-w-0 rounded-md border-[2px] bg-transparent px-3 pt-1 pb-1 text-sm md:text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
                        "focus-visible:border-primary",
                        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                        hasIcon && "pl-10",
                        isLabelFloating ? "border-primary" : "",
                        className
                    )}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    onChange={handleChange}
                    {...props}
                />
                {label && (
                    <label
                        className={cn(
                            "absolute text-muted-foreground pointer-events-none transition-all duration-200 ease-out",
                            hasIcon ? "left-10" : "left-3",
                            isLabelFloating
                                ? "top-0 -translate-y-1/2 text-xs md:text-sm text-primary px-1 bg-background"
                                : "top-1/2 -translate-y-1/2 text-sm md:text-base"
                        )}
                    >
                        {label}
                    </label>
                )}
            </div>
        );
    }
);

Input.displayName = "Input";

export { Input }