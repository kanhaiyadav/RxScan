"use client"

import * as React from "react"
import { CheckIcon, ChevronDownIcon, Search } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchableSelectOption {
    value: string
    label: string
}

interface SearchableSelectProps {
    options: SearchableSelectOption[] | string[]
    value?: string
    onValueChange?: (value: string) => void
    label?: string
    icon?: React.ReactNode
    field?: keyof SearchableSelectOption
    placeholder?: string
    className?: string
    disabled?: boolean
}

const SearchableSelect = React.forwardRef<HTMLDivElement, SearchableSelectProps>(
    ({ options, value, onValueChange, label, icon, field, placeholder, className, disabled }, ref) => {
        const [isOpen, setIsOpen] = React.useState(false)
        const [searchQuery, setSearchQuery] = React.useState("")
        const [selectedValue, setSelectedValue] = React.useState(value || "")
        const containerRef = React.useRef<HTMLDivElement>(null)
        const inputRef = React.useRef<HTMLInputElement>(null)

        const isLabelFloating = isOpen || selectedValue || searchQuery
        const hasIcon = !!icon

        // Filter options based on search query
        const filteredOptions = React.useMemo(() => {
            if (!searchQuery) return options
            const filtered = options.filter(option => {
                if (typeof option === 'string') {
                    return option.toLowerCase().includes(searchQuery.toLowerCase())
                } else {
                    if (field) {
                        return option[field]?.toLowerCase().includes(searchQuery.toLowerCase())
                    } else {
                        return true;
                    }
                }
            })
            return filtered
        }, [options, searchQuery])

        // Get selected option label
        const selectedLabel = React.useMemo(() => {
            const option = options.find(opt =>
                typeof opt === 'string' ? opt === selectedValue : opt.value === selectedValue
            );
            if (typeof option === 'string') {
                return option;
            } else if (option) {
                return option.label;
            }
            return "";
        }, [options, selectedValue]);

        // Handle clicking outside
        React.useEffect(() => {
            const handleClickOutside = (event: MouseEvent) => {
                if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                    setIsOpen(false)
                    setSearchQuery("")
                }
            }

            document.addEventListener("mousedown", handleClickOutside)
            return () => document.removeEventListener("mousedown", handleClickOutside)
        }, [])

        // Focus input when opened
        React.useEffect(() => {
            if (isOpen && inputRef.current) {
                inputRef.current.focus()
            } else {
                inputRef.current?.blur()
            }
        }, [isOpen])

        const handleSelect = (optionValue: string) => {
            setSelectedValue(optionValue)
            onValueChange?.(optionValue)
            setIsOpen(false)
            setSearchQuery("")
            setSelectedValue("");
        }

        const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
        }

        const handleInputFocus = () => {
            setIsOpen(true)
        }

        return (
            <div ref={containerRef} className={cn("relative", className)}>
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none z-10">
                        {icon}
                    </div>
                )}

                <form onSubmit={(e) => {
                    e.preventDefault();
                    setSelectedValue(searchQuery);
                    handleSelect(searchQuery);
                    setIsOpen(false);
                }} className="relative">
                    <input
                        ref={inputRef}
                        type="text"
                        value={isOpen ? searchQuery : selectedLabel}
                        onChange={handleInputChange}
                        onFocus={handleInputFocus}
                        disabled={disabled}
                        className={cn(
                            "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-black/30 h-12 w-full min-w-0 rounded-md border-[2px] bg-transparent px-3 pt-1 pb-1 text-sm md:text-base shadow-xs transition-[color,box-shadow] outline-none disabled:cursor-not-allowed disabled:opacity-50",
                            "focus-visible:border-primary",
                            hasIcon && "pl-10",
                            isLabelFloating && "border-primary",
                            "pr-10"
                        )}
                        placeholder={isOpen && !label ? placeholder : ""}
                    />

                    <button
                        type="button"
                        onClick={() => {
                            if (!disabled) {
                                setIsOpen(!isOpen)
                                if (!isOpen) {
                                    setSearchQuery("")
                                }
                            }
                        }}
                        disabled={disabled}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ChevronDownIcon
                            className={cn(
                                "size-4 transition-transform duration-200",
                                isOpen && "rotate-180"
                            )}
                        />
                    </button>
                </form>

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

                {isOpen && (
                    <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md max-h-60 overflow-y-auto">
                        <div className="p-1">
                            {filteredOptions.length === 0 ? (
                                <div className="px-2 py-6 text-center text-sm text-muted-foreground">
                                    No results found
                                    <p>Press enter to add <span className="font-medium text-primary">{searchQuery}</span> in the list</p>
                                </div>
                            ) : (
                                filteredOptions.map((option) => {
                                    const optionValue = typeof option === 'string' ? option : option.value;
                                    const optionLabel = typeof option === 'string' ? option : option.label;

                                    return (
                                        <div
                                            key={optionValue}
                                            onClick={() => handleSelect(optionValue)}
                                            className={cn(
                                                "relative flex w-full cursor-pointer items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-none select-none hover:bg-accent hover:text-accent-foreground",
                                                optionValue === selectedValue && "bg-accent/50"
                                            )}
                                        >
                                            <span className="flex-1">{optionLabel}</span>
                                            {optionValue === selectedValue && (
                                                <span className="absolute right-2 flex size-3.5 items-center justify-center">
                                                    <CheckIcon className="size-4 text-primary" />
                                                </span>
                                            )}
                                        </div>
                                    )
                                })
                            )}
                        </div>
                    </div>
                )}
            </div>
        )
    }
)

SearchableSelect.displayName = "SearchableSelect"

export { SearchableSelect }
export type { SearchableSelectOption, SearchableSelectProps }