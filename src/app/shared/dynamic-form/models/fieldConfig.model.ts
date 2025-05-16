import { FormGroup } from '@angular/forms';
import { Observable, Subject } from 'rxjs';

import { InputTypes } from '../constants/InputTypes.enum';
import { Configs } from './configs.class';
import { Options } from './options.model';
import { Validator } from './validator.model';

export class FieldConfig {

    label?: string;
    name?: string;
    type?: InputTypes | string;
    options?: Options[];
    collections?: any;
	element: string;
	disabled?:boolean;
    values?: any;
    validations?: Validator[]
    style?: string;
    classes?: string[];
    children?: FieldConfig[]
    onSubmit?: any;
    configs?: Configs;
    //for autocomplete
    bindLabel?: string;
    bindValue?: string;
    multiple?: boolean;
	items: any[];
    id?: any;
	form: FormGroup;
	onFocus?:any;
	onBlur?:any;
	onClear?:any;
	onOpen?:any;
	max?:any;
    groupBy?:string;
    selectableGroup?: boolean = true;
    selectableGroupAsModel?: boolean = false;
	selected_case_type_slug?:string
	allowed_case_type_slugs?:string[]=[];
	onScrollToEnd?:any;
	onTypeahead$?:Subject<any>=new Subject<any>() ;
	onTypeaheadEvent?:any;
    onScroll?:any;
    onResetEvent$?: Observable<any>;
    onRemoveItemEvent$?: Subject<Boolean>;
    onDataFetch$?: Observable<any>;
    onDataFetchEvent?: any;
	qualifierBoolean:boolean = false;
    bindLabelForTooltips: string;
	bindQualifierLabel:string;
	bindTooltipLabel?:string;
    bindConcatinationIsAllow?:boolean;
    input_type_status?:string='default';
	showDialog?:boolean = false;
    dialogMessage?:string;
    optionSelected?:string   
}
