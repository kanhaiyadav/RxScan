import { Select, SelectBackdrop, SelectContent, SelectDragIndicator, SelectDragIndicatorWrapper, SelectIcon, SelectInput, SelectItem, SelectPortal, SelectTrigger } from '@/components/ui/select';
import { ChevronDownIcon } from './ui/icon';

const SelectCustom = ({ children, selectedValue, onValueChange, isDisabled, placeholder }: {
    children: React.ReactNode;
    selectedValue: string;
    onValueChange: (value: string) => void;
    isDisabled?: boolean;
    placeholder: string;
}) => {
    return (
        <Select
            selectedValue={selectedValue}
            onValueChange={onValueChange}
            isDisabled={isDisabled}
        >
            <SelectTrigger variant="underlined" size="lg" >
                <SelectInput placeholder={placeholder} className='h-[50px] px-4 text-typography-600 text-md' />
                <SelectIcon className="mr-3">
                    <ChevronDownIcon />
                </SelectIcon>
            </SelectTrigger>
            <SelectPortal>
                <SelectBackdrop />
                <SelectContent>
                    <SelectDragIndicatorWrapper>
                        <SelectDragIndicator />
                    </SelectDragIndicatorWrapper>
                    {children}
                </SelectContent>
            </SelectPortal>
        </Select>
    )
}

export default SelectCustom;