import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import { of, Subject, Subscription } from 'rxjs';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { FieldConfig } from '../../models/fieldConfig.model';
import { v4 as uuidv4 } from 'uuid';
import { NgSelectComponent } from '@ng-select/ng-select';
import { GetOnlyUniqueValues, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { isObject } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';
import * as _ from 'lodash';

@Component({
  selector: 'app-ng-select-component',
  templateUrl: './ng-select-filter.component.html',
  styleUrls: ['./ng-select-filter.component.scss']
})
export class NgSelectFilterComponent implements OnInit, OnDestroy, AfterViewInit {
 @ViewChild('tagngSelect')tagngSelect:NgSelectComponent
 	textSearch = new FormControl('');
	fieldFocused :boolean=false;
	selectedItemDisplay='';
	selectedItem = [];
	constructor(private fb: FormBuilder) {

		this.id = uuidv4()
	}
	onTypeahead$ = new Subject();
	onDataFetchEvent$ = new Subject();
	field: FieldConfig;
	group: FormGroup;
	id: string;
	subscription: Subscription[] = [];
	appendIcon: boolean = false;
	appendCounter: number = 0;
	dropdownWidth: number =0;
	dropdownHeight: number=0;
	isSelectAllInProgress: boolean = false;
	typingSearch: boolean = false;
	@ViewChild('ngSelectOuter', { static: false }) ngSelectOuter: ElementRef;


	ngOnDestroy(): void {
		unSubAllPrevious(this.subscription);
	}
	
	ngOnChanges() {

	}
	ngAfterViewInit(): void {
		this.displayToolTipOnFetchEditMood();
		this.getDropdownDimensions();
		if (this.field.onDataFetch$){
			this.subscription.push(
				this.field.onDataFetch$
				.subscribe(res=>{
					this.field.onDataFetchEvent(res).subscribe(items => {
						this.commonBindingValue(items);
						this.getChange(items);
					})
				})
			)
		}
	}
	// items: [] = []
	ngOnInit() {
		// this.items = this.field.items
		if(this.field.onTypeahead$)
		{
			this.field.onTypeahead$
			.pipe(
				distinctUntilChanged(),
				debounceTime(30),
				)
			.subscribe(res=>{
				this.field.onTypeaheadEvent(res).subscribe(items => {
					this.commonBindingValue(items);
				})
			})
		}
		this.eventSubscriptions();
	}
	keyDownEvent(event) {
		this.typingSearch = true;
		if (this.field.onSubmit)
			this.field.onSubmit(event.target.value).subscribe(items => {
				this.commonBindingValue(items);
			})
	}
	onBlurEvent(event) {
		this.fieldFocused=false
		if (this.field.onBlur)
			this.field.onBlur(event.target.value).subscribe(items => {
				this.commonBindingValue(items);
			})
	}

	onFocusEvent(event) {
	this.fieldFocused=true
		if (this.field.onFocus)
			this.field.onFocus(event.target.value).subscribe(items => {
				this.commonBindingValue(items);
			})
	}

	onClearEvent(event) {
		this.appendCounter = 0;
		this.selectedItem = [];
		this.selectedItemDisplay = '';
		if (this.field.onClear)
			this.field.onClear().subscribe(items => {
				this.commonBindingValue(items);
			})
	}

	onOpenEvent(event)
	{
		if (this.field.onOpen)
		this.field.onOpen().subscribe(items => {
			this.commonBindingValue(items);
		})
		setTimeout(() => {
        const scrollContainer = document.querySelector(
        '.ng-dropdown-panel-items'
        );
    	if (scrollContainer) {
        scrollContainer.scrollTop = 0;
      	}
    	}, 0);
	}

	onScrollToEndEvent(event)
	{	
		if(!this.isSelectAllInProgress){
			if (this.field.onScrollToEnd)
			this.field.onScrollToEnd().subscribe(items => {
				this.commonBindingValue(items);
			})
		}
	}

	addTagFn(name) {
		if(this['labelForId']){
			return {id:name,[this['bindLabel']]:name, [this['labelForId']]:name,tag: true }
		}
        return {id:name, [this['bindLabel']]:name,tag: true };
    }
	
	eventSubscriptions(): void {
		if (this.field.onResetEvent$) {
			this.subscription.push(
				this.field.onResetEvent$.subscribe((res) => {
					if (res) {
						this.field.items = [];
						this.selectedItem = [];
						this.selectedItemDisplay = "";
					}
				})
			);
		}
		
	}
	add($event){
		this.field.items;
		if($event && typeof $event === 'object'){
			if ($event?.id && $event?.is_select){	
				const idExists = this.selectedItem.some(item => item.id === $event.id);
				if(!idExists){
					this.selectedItem.push({id: $event?.id, is_select: "all", name: $event[this.field['bindTooltipLabel']]});
				}		
			}else{
				if($event?.id && !$event?.is_select )
				{
					const idExists = this.selectedItem.some(item => item.id === $event?.id);
					if(!idExists){
						this.selectedItem.push({id: $event.id, name: $event[this.field['bindTooltipLabel']]})
					}
				}
			}
			this.field.items = [...this.selectedItem, ...this.field.items];
			this.field.items = GetOnlyUniqueValues(this.field.items, 'id');
			this.selectedItemDisplay = this.selectedItem.map(res => res.name ? res.name : res.full_name ? res.full_name : res[this.field.bindLabel]).toString();
		}
	}
	displayToolTipOnFetchEditMood() {
		if(this.field.items.length > 0){
			this.selectedItemDisplay = this.field.items.map(res => res['bindTooltipLabel']).toString();
		}
	}
	remove($event: any){
		if($event){
			const index = this.selectedItem.findIndex(res => res.id === $event.value.id);
			if (index !== -1){
				this.selectedItem.splice(index,1);
			}
			this.field.items = [...this.selectedItem, ...this.field.items.filter(item => !this.selectedItem.some(selected => selected.id === item.id))];
			this.field.items = [...this.field.items];
			this.field.items = GetOnlyUniqueValues(this.field.items, 'id');
			this.selectedItemDisplay = this.selectedItem.map(res => res.name).toString();
		}
	}
	getChange($event: any) {
		this.getDropdownDimensions();
		this.textSearch.setValue('');

		if ($event !== undefined){
			if(!(isObject($event) && $event?.['type'] == 'change')){
				this.selectedItem = $event;
			}else return

			if($event?.length === this.field?.items?.length){
				this.selectAllDynamicSpacing();
			}
			else{
				if (Array.isArray($event) && $event?.length !== this.field?.items?.length) {
					this.selectAllDynamicSpacing();
				  } else {
					this.singleDynamicSpacing();
				  }
			}
		}

		if($event && $event.length === 0 ){
			this.selectedItem = [];
			this.selectedItemDisplay = '';
		}
		
	}

	trackByFn(item: any): any {
		return item;
	}

	commonBindingValue(data: any){

		if(this.field.bindConcatinationIsAllow){
			this.field.items =  data.map( res => {
					return res = {
						...res,
						...{'customBind': `${res.first_name} ${res.middle_name ? res.middle_name: '' } ${res.last_name}`}
					}
			})
		}else{
			this.field.items = [...this.selectedItem, ...data.filter(item => !this.selectedItem.some(selected => selected.id === item.id))];
			if(this.typingSearch === true){
				this.field.items = [...data,...this.selectedItem ];
				this.typingSearch = false;
			}
		}
		this.field.items = GetOnlyUniqueValues(this.field.items, 'id');
	}

	getDropdownDimensions() {
		if(this.field?.optionSelected){
			this.tagngSelect.labelForId = this.field?.optionSelected
		}
		this.dropdownHeight = this.ngSelectOuter?.nativeElement?.clientHeight;
		this.dropdownWidth = this.ngSelectOuter?.nativeElement?.clientWidth;
	}

	singleDynamicSpacing(){
		let emptyString: string='';

		for(let i in this.selectedItem){
			emptyString += (this.selectedItem[i]?.qualifier ? this.selectedItem[i]?.qualifier : this.selectedItem[i]?.[this.field.bindLabel]) + " x ";
		}

		let tempElement = document.createElement('span');
    	tempElement.style.visibility = 'hidden';
    	tempElement.style.position = 'absolute';
    	tempElement.style.whiteSpace = 'nowrap';
    	tempElement.textContent = emptyString;

    	// Append the temporary element to the document body
    	document.body.appendChild(tempElement);

    	// Get the width of the string
    	let stringWidth = tempElement.offsetWidth+100;

		if(stringWidth <= this.dropdownWidth){
			this.appendIcon = false;
				this.appendCounter = this.selectedItem?.length;
			
		}else{
			this.appendIcon = true;
			if (this.appendCounter === this.selectedItem?.length && stringWidth >= this.dropdownWidth){
				this.appendCounter--;
			}
		}
		// Remove the temporary element
		document.body.removeChild(tempElement);

	}

	selectAllDynamicSpacing(){
		this.appendCounter =0;
		let emptyString: string='';
		this.isSelectAllInProgress = true;
		let tempElement = document.createElement('span');
		tempElement.style.visibility = 'hidden';
		tempElement.style.position = 'absolute';
		tempElement.style.whiteSpace = 'nowrap';

		for(let i in this.selectedItem){

			emptyString += (this.selectedItem[i]?.qualifier ? this.selectedItem[i]?.qualifier : this.selectedItem[i]?.[this.field.bindLabel]) + " x ";
			
			tempElement.textContent = emptyString;

			// Append the temporary element to the document body
			document.body.appendChild(tempElement);

			// Get the width of the string
			let stringWidth = tempElement.offsetWidth+100;

			if (stringWidth <= this.dropdownWidth) {
				this.appendIcon = false;
				this.appendCounter ++; // Show all items
			  } else {
				this.appendIcon = true;
				if (this.appendCounter === this.selectedItem?.length && stringWidth >= this.dropdownWidth){
					this.appendCounter--;
				}
			  }
			// Remove the temporary element
			document.body.removeChild(tempElement);
		}
		this.isSelectAllInProgress = false;
	} 
}