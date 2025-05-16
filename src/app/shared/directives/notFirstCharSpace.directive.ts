import { Directive, ElementRef, HostListener, Output, EventEmitter, forwardRef, Renderer2 } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, DefaultValueAccessor } from '@angular/forms';

const TRIM_VALUE_ACCESSOR: any = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => notFirstCharactorSpaceDirective),
    multi: true
};

@Directive({
    selector: 'input[notFirstCharactorSpace] ,textarea[notFirstCharactorSpace]',
    providers: [TRIM_VALUE_ACCESSOR]
})
export class notFirstCharactorSpaceDirective extends DefaultValueAccessor {

    @HostListener('input', ['$event.target.value'])
    ngOnChange = (val: string) => {
        this.onChange(this.lTrim(val) ? this.lTrim(val) : '');
        this.writeValue(this.lTrim(val));
    };

    @HostListener('blur', ['$event.target.value'])
    ngOnBlur = (val: string) => {
        this.writeValue(this.lTrim(val));
        this.onTouched();
    };

    writeValue(value: any): void {
        if (typeof value === 'string') {
            value = this.lTrim(value);
        }

        super.writeValue(value);
    }
    lTrim(str) {
        if (!str) return str;
        return str.replace(/^\s+/g, '');
    }
}
