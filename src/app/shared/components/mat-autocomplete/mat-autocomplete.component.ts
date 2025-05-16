import { ActivatedRoute } from '@angular/router';
import {
	COMMA,
	ENTER,
} from '@angular/cdk/keycodes';
import {
	AfterContentChecked,
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	Input,
	OnChanges,
	OnDestroy,
	OnInit,
	Output,
	Pipe,
	PipeTransform,
	QueryList,
	SimpleChanges,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import {
	MatAutocomplete,
	MatAutocompleteSelectedEvent,
	MatAutocompleteTrigger,
} from '@angular/material/autocomplete';

import { ToastrService } from 'ngx-toastr';
import { Observable, Subscription } from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged,
	map,
	startWith,
} from 'rxjs/operators';

import { MainService } from '@appDir/shared/services/main-service';
import { isSameLoginUser, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { MatChipInputEvent } from '@angular/material/chips';
import { MatCheckboxChange } from '@angular/material/checkbox';
import * as _ from 'lodash';
@Component({
	selector: 'app-mat-autocomplete',
	templateUrl: './mat-autocomplete.component.html',
	styleUrls: ['./mat-autocomplete.component.scss'],
})
export class MatAutocompleteComponent  implements OnChanges, OnInit, OnDestroy
  {
	visible = true;
	selectable = true;
	removable = true;
	userId;
	@Input() label: string;
	toHighlight: string = '';
	separatorKeysCodes: number[] = [ENTER, COMMA];
	inputControl = new FormControl();
	@Input() multiple: boolean = true;
	@Input() addOnBlur: boolean = true;
	filteredOptions: Observable<any>;
	@Input() selectedOptions;
	@Input() max;
	@Input() selected_case_type_slug: string;
	@Input() allowed_case_type_slugs: string[] = []
	@Input() dialogMessage:string = '';
	@Input() placeHolder;
	@Input() loader = false;
	@Input() options;
	@Input() showconfirmationdialog: boolean = false;
	@Output() onkeyUp = new EventEmitter();
	@Output() onScrolled = new EventEmitter();
	@Input() disabled: boolean = false;
	@Input() maxLength:number = 40;
	@Output() onChangeEmitter = new EventEmitter();
	value;
	@ViewChild('chiplistInput') chiplistInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;
	@ViewChild('divToScroll') divToScroll: ElementRef;
	subscription: Subscription[] = [];
	private subscr: Subscription;
	@ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
	@ViewChildren('checks') checks :QueryList<any>;
	ngOnInit() {
		this.max = this.max || 0;
		// this.cd.detach();
		if(this.disabled){
			this.inputControl.disable()
		}
	}
	ngOnChanges(changes: SimpleChanges): void {
		this.selectedOptions = this.selectedOptions || [];
		this.filteredOptions = new Observable((ob) => {
			this.options?.forEach(opt =>{
				let item = this.selectedOptions?.find(selectOpt => opt?.id === selectOpt?.id)
				if(item){
					opt['selected'] = true;
				}else{
					opt['selected'] = false;
				}
			});
			ob.next(this.options);
			this.toHighlight = this.value;
			ob.complete();
		});
		if (this.route && this.route.parent && this.route.parent.snapshot) {
			this.userId = this.route.parent.snapshot.params.id;
			if (isSameLoginUser(this.userId)) {
				this.inputControl.disable();
			}
		}
	}


	constructor(public toastrService: ToastrService, public mainService: MainService, private route: ActivatedRoute, private customDiallogService: CustomDiallogService, private cd: ChangeDetectorRef) {
		this.label = this.label || 'Search By ICD CODE Code Or Description (Maximum 6)';
		this.selectedOptions = [];
		
		this.filteredFruits =
		 this.inputControl.valueChanges
		.pipe(debounceTime(500), distinctUntilChanged()).subscribe(data=>{
				this.value = data;
			if (this.inputControl.value !== null) {
				this.onkeyUp.emit(data);
			}
		});
	}
	ngOnDestroy(): void {
		this.filteredFruits.unsubscribe();
		unSubAllPrevious(this.subscription);
	}

	remove(selectedOption: string): void {
		if (this.disabled) {
			return;
		}
		const index = this.selectedOptions.indexOf(selectedOption);

		if (index >= 0) {
			this.selectedOptions.splice(index, 1);
			this.onChangeEmitter.emit(this.selectedOptions);
		}this.getOptionsSelected();
	}
	onFocusInput(event){
		if(event){
			if(this.options?.length || this.selectedOptions?.length)
			this.getOptionsSelected();
		}
	}
	changeSelection(event:MatCheckboxChange,option){
		if(event.checked){
			if (this.showconfirmationdialog && this.selectedOptions.length) {
				this.autocomplete.closePanel();
				this.chiplistInput.nativeElement.value = '';
				this.inputControl.setValue(null);
				this.toHighlight = '';
				this.customDiallogService.confirm('Are you sure?', this.dialogMessage, 'Yes', 'No')
					.then((confirmed) => {
						if(confirmed){
							this.selectedOptions = [];
							this.selectedOptions.push(option);
							this.onChangeEmitter.emit(this.selectedOptions);
						}else{
							let index = this.options?.findIndex(opt => opt?.id === this.selectedOptions?.[0]?.id);
							this.checks?.forEach((chk,idx) =>{
								if(idx  == index){
									chk.checked = true
								}else{
									chk.checked = false
								}
							})
						}
					})
			} else {
				if (!this.multiple) {
					this.selectedOptions = [];
					this.selectedOptions.push(option);
					this.chiplistInput.nativeElement.value = '';
					this.inputControl.setValue(null);
					this.onChangeEmitter.emit(this.selectedOptions);
					this.toHighlight = '';
				} else {
					if (this.selectedOptions.length !== 0 && this.max>0) {
						const find = this.selectedOptions.findIndex((x) => x.id === option.id);
						if (find === -1) {
							this.selectedOptions.push(option);
							this.chiplistInput.nativeElement.value = '';
							this.inputControl.setValue(null);				
							this.onChangeEmitter.emit(this.selectedOptions);
							this.toHighlight = '';
						} else {
							this.chiplistInput.nativeElement.value = '';
							this.inputControl.setValue(null);
						}
					} else {
						const find = this.selectedOptions.findIndex((x) => x.id === option.id);
						if (find === -1) {
							this.selectedOptions.push(option);
						this.chiplistInput.nativeElement.value = '';
						this.inputControl.setValue(null);
						this.onChangeEmitter.emit(this.selectedOptions);
						this.toHighlight = '';
						}
						else
						{
							this.chiplistInput.nativeElement.value = '';
							this.inputControl.setValue(null);
						}
					}
				}
				this.chiplistInput?.nativeElement?.focus();
			}
			this.getOptionsSelected();
		}else{
			if (this.disabled) {
				return;
			}
			const index = this.selectedOptions?.findIndex(opt => opt?.id === option?.id);
			if (index >= 0) {
				this.selectedOptions.splice(index, 1);
				this.onChangeEmitter.emit(this.selectedOptions);
			}
			this.chiplistInput?.nativeElement?.focus();
			if(this.options?.every(opt => !opt.selected)){
				this.inputControl.setValue('  ')
			}
		this.getOptionsSelected();
		}
	}
	getOptionsSelected(){
		this.options?.forEach(opt =>{
			let item = this.selectedOptions?.find(selectOpt => opt?.id === selectOpt?.id)
			if(item){
				opt['selected'] = true;
			}else{
				opt['selected'] = false;
			}
		});
	}
	onScroll() {
		this.onScrolled.emit('scrollDown');
	}

	trackByCodeCode(index: number, codeInfo: any): any {
		return index;
	}
	// ngAfterContentChecked(): void {
	// 	this.cd.detectChanges();
	// }

	// separatorKeysCodes: number[] = [ENTER, COMMA];
	fruitCtrl = new FormControl('');
	filteredFruits:any;
	fruits: string[] = ['Lemon'];
  
	@ViewChild('fruitInput') fruitInput: ElementRef<HTMLInputElement>;
  
	
  
	add(event: MatChipInputEvent): void {
	  const value = (event.value || '').trim();
	  // Add our fruit
	  if (value) {
		this.fruits.push(value);
	  }
	  // Clear the input value
	  event.chipInput!.clear();
	  this.inputControl.setValue(null);
	}
  
	// remove(fruit: string): void {
	//   const index = this.fruits.indexOf(fruit);
  
	//   if (index >= 0) {
	// 	this.fruits.splice(index, 1);
	//   }
	// }
  
	// selected(event: MatAutocompleteSelectedEvent): void {
	//   this.fruits.push(event.option.viewValue);
	//   this.fruitInput.nativeElement.value = '';
	//   this.fruitCtrl.setValue(null);
	// }
}
@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
	transform(text: string, search): string {
		if (search) {
			if(typeof search === 'string'){
				const pattern = search
					.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, '\\$&')
					.split(' ')
					.filter((t) => t.length > 0)
					.join('|');
				const regex = new RegExp(pattern, 'gi');
				const match = text.match(regex);
				if (!match) {
					return text;
				}
				return search ? text.replace(regex, (match) => `<b>${match}</b>`) : text;
			}
		}
	}
}
