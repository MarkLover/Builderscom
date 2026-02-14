import * as React from "react"
import { useState, useCallback } from "react"
import { cn } from "@/lib/utils"

/**
 * Formats a number string with space-separated thousands.
 * Input: "1234567.89" → "1 234 567.89"
 */
const formatWithSpaces = (value: string): string => {
    if (!value) return '';

    // Split integer and decimal parts
    const parts = value.split('.');
    const intPart = parts[0].replace(/\s/g, '');
    const decPart = parts.length > 1 ? '.' + parts[1] : '';

    // Add spaces every 3 digits from the right
    const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    return formatted + decPart;
};

/**
 * Strips formatting to get raw number string.
 * "1 234 567.89" → "1234567.89"
 */
const stripFormatting = (value: string): string => {
    return value.replace(/\s/g, '');
};

interface MoneyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange' | 'value'> {
    /** Form field name — raw numeric value will be submitted under this name */
    name: string;
    /** Controlled value (raw number or undefined) */
    value?: number | string;
    /** Change handler that receives the raw numeric value */
    onChange?: (value: number | undefined) => void;
    /** Allow decimal values */
    allowDecimals?: boolean;
}

const MoneyInput = React.forwardRef<HTMLInputElement, MoneyInputProps>(
    ({ className, name, value, onChange, allowDecimals = true, placeholder, ...props }, ref) => {
        // Internal display value (formatted string)
        const [displayValue, setDisplayValue] = useState<string>(() => {
            if (value !== undefined && value !== '' && value !== null) {
                return formatWithSpaces(String(value));
            }
            return '';
        });

        // Raw numeric value for form submission
        const rawValue = stripFormatting(displayValue);

        const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
            const input = e.target.value;

            // Allow only digits, spaces, and optionally one decimal point
            const pattern = allowDecimals ? /[^\d.\s]/g : /[^\d\s]/g;
            let cleaned = input.replace(pattern, '');

            // Ensure only one decimal point
            if (allowDecimals) {
                const dotIndex = cleaned.indexOf('.');
                if (dotIndex !== -1) {
                    cleaned = cleaned.slice(0, dotIndex + 1) + cleaned.slice(dotIndex + 1).replace(/\./g, '');
                }
            }

            // Strip spaces for raw value, then re-format
            const raw = cleaned.replace(/\s/g, '');
            const formatted = formatWithSpaces(raw);

            setDisplayValue(formatted);

            if (onChange) {
                const num = raw ? parseFloat(raw) : undefined;
                onChange(num);
            }
        }, [onChange, allowDecimals]);

        // Sync with external value changes
        React.useEffect(() => {
            if (value !== undefined && value !== '' && value !== null) {
                const newFormatted = formatWithSpaces(String(value));
                if (stripFormatting(displayValue) !== String(value)) {
                    setDisplayValue(newFormatted);
                }
            }
        }, [value]);

        return (
            <>
                {/* Hidden input submits the raw numeric value for FormData */}
                <input type="hidden" name={name} value={rawValue} />
                {/* Visible formatted input */}
                <input
                    type="text"
                    inputMode="decimal"
                    className={cn(
                        "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                        className
                    )}
                    ref={ref}
                    value={displayValue}
                    onChange={handleChange}
                    placeholder={placeholder || "0"}
                    {...props}
                />
            </>
        );
    }
);
MoneyInput.displayName = "MoneyInput";

export { MoneyInput };
