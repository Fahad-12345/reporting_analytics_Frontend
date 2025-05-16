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
	OnInit,
	Output,
	Pipe,
	PipeTransform,
	QueryList,
	SimpleChanges,
	ViewChild,
	ViewChildren,
} from '@angular/core';
import {
	FormControl,
	FormGroup,
} from '@angular/forms';
import {
	MatAutocomplete,
	MatAutocompleteSelectedEvent,
	MatAutocompleteTrigger,
} from '@angular/material/autocomplete';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';

import { ToastrService } from 'ngx-toastr';
import {
	Observable,
	Subject,
} from 'rxjs';
import {
	debounceTime,
	distinctUntilChanged,
} from 'rxjs/operators';

import { FieldConfig } from '../../models/fieldConfig.model';
import { MatCheckboxChange } from '@angular/material/checkbox';
import * as _ from 'lodash';
@Component({
	selector: 'app-mat-autocomplete',
	templateUrl: './mat-search-filter.component.html',
	styleUrls: ['./mat-search-filter.component.scss'],
})
export class MatSearchFilterComponent implements OnChanges, AfterContentChecked,OnInit {
	visible = true;
	selectable = true;
	removable = true;
	@Input() label: string;
	toHighlight: string = '';
	separatorKeysCodes: number[] = [ENTER, COMMA];
	searchControl = new FormControl();
	filteredOptions: Observable<any>;
	@Input() selectedOptions;
	@Input() options = [];
	@Input() max:number=0
	@Output() onkeyUp = new EventEmitter();
	@Output() onScrolled = new EventEmitter();
	@Output() onChangeEmitter = new EventEmitter();
	value;
	@ViewChild('searchInput') searchInput: ElementRef<HTMLInputElement>;
	@ViewChild('auto') matAutocomplete: MatAutocomplete;
	field: FieldConfig;
	group: FormGroup ;
	id: string;
	modelChanged: Subject<string> = new Subject<string>();
	@Input() disabled: boolean =false;
	@ViewChild(MatAutocompleteTrigger) autocomplete: MatAutocompleteTrigger;
	@ViewChildren('checks') checks :QueryList<any>;

	ngOnChanges(changes: SimpleChanges): void {}
	ngOnInit() {
		this.label = this.field.label || 'Search By ICD CODE Code Or Description ';
		this.field.max=this.field.max|| 0
		this.disabled = this.field?this.field.disabled:false;

		this.group.get(this.field && this.field.name).valueChanges.subscribe((data) => {
			this.selectedOptions = data;
		});
		this.cd.detach();
		if(this.disabled){
			this.searchControl.disable();
		}
	}
	constructor(public toastrService: ToastrService, private customDiallogService: CustomDiallogService, private cd: ChangeDetectorRef) {
		this.modelChanged.pipe(distinctUntilChanged(), debounceTime(300)).subscribe((text) => {
				this.toHighlight = text;
				this.field.onSubmit(text).subscribe((items) => {
					this.options = [];
					this.options = items;
					this.filteredOptions = new Observable((ob) => {
						items?.forEach(opt =>{
							let item = this.selectedOptions?.find(selectOpt => opt?.id === selectOpt?.id);
							if(item){
								opt['selected'] = true;
							}else{
								opt['selected'] = false;
							}
						});
						ob.next(items);
					});
				});
		});
	}

	remove(selectedOption: any): void {
		if (this.disabled){
			return;
		}
		const index = this.selectedOptions.indexOf(selectedOption);
		if (index >= 0) {
			let inneridx = this.options?.findIndex(opt => opt?.id === selectedOption?.id);
			this.checks?.forEach((chk,idx) =>{
			if(idx  === inneridx){
				chk.checked = false;
			}});
			this.selectedOptions.splice(index, 1);
			this.group.get(this.field && this.field.name).setValue(this.selectedOptions);
			this.onChangeEmitter.emit(this.selectedOptions);
		}
	}
	changeSelection(event:MatCheckboxChange,option){
		if (this.disabled){
			return;
		}
		if(event?.checked){
			if(this.field.showDialog && this.selectedOptions.length){
				this.autocomplete.closePanel();
				this.searchInput.nativeElement.value = '';
				this.toHighlight = '';
				this.customDiallogService.confirm('Are you sure?',this.field.dialogMessage,'Yes','No').then((confirmed)=>{
					if(confirmed){
						this.selectedOptions = [];
						this.selectedOptions.push(option);	
						this.onChangeEmitter.emit(this.selectedOptions);
						this.group.get(this.field && this.field.name).setValue(this.selectedOptions);
					}
					let index = this.options?.findIndex(opt => opt?.id === this.selectedOptions?.[0]?.id);
					this.checks?.forEach((chk,idx) =>{
						if(idx  === index){
							chk.checked = true
						}else{
							chk.checked = false
						}
					});
				});
			}else{
				if (!(this.field && this.field.multiple)) {
					this.selectedOptions = [];
					this.selectedOptions.push(option);
					this.searchInput.nativeElement.value = '';
					this.onChangeEmitter.emit(this.selectedOptions);
					this.group.get(this.field.name).setValue(this.selectedOptions);
					this.toHighlight = '';
				} else {
					if (this.selectedOptions.length !== 0 && this.field.max>0) {
					const find = this.selectedOptions.findIndex((x) => x.id === option.id);
					if (find === -1) {
						let selected_allowed_case_type_slug=this.field.allowed_case_type_slugs&&this.field.allowed_case_type_slugs.findIndex((case_type_slug)=>case_type_slug==this.field.selected_case_type_slug)
						if ((this.selectedOptions.length < this.field.max)|| selected_allowed_case_type_slug>-1 ) {
							this.searchInput.nativeElement.value = '';
							this.searchControl.setValue(null);
							this.onChangeEmitter.emit(this.selectedOptions);
							this.toHighlight = '';
							this.selectedOptions.push(option);
							this.group.get(this.field && this.field.name).setValue(this.selectedOptions);
						} else {
							this.toastrService.error('Maximum ' +this.field.max +' codes are allowed', 'ERROR');
						}
					}
				} else {
					this.selectedOptions.push(option);
					this.searchInput.nativeElement.value = '';
					this.group.get(this.field.name).setValue(this.selectedOptions);
					this.searchControl.setValue(null);
					this.onChangeEmitter.emit(this.selectedOptions);
					this.toHighlight = null;
				}
				}
				this.searchInput?.nativeElement?.focus();
			}
		}else{
			if (this.disabled){
				return;
			}
			const index = this.selectedOptions.findIndex(opt => opt?.id === option?.id);
			if (index >= 0) {
				this.selectedOptions.splice(index, 1);
				this.group.get(this.field && this.field.name).setValue(this.selectedOptions);
				this.onChangeEmitter.emit(this.selectedOptions);
			}
			if(!(this.checks?.filter(opt => opt.checked)?.length)){
				this.modelChanged.next('   ')
			}
			this.searchInput?.nativeElement?.focus();
		}
	}
	onKeyUp(searchTextValue: string) {
		this.modelChanged.next(searchTextValue);
	}

	onScroll(){
		if (this.field){
		this.field.onScroll().subscribe(items => {
			this.options = items;
			items?.forEach(opt =>{
				let item = this.selectedOptions?.find(selectOpt => opt?.id === selectOpt?.id);
				let index = this.options?.findIndex(opt => opt?.id === item?.id);
				if(index != -1){
					this.checks?.forEach((chk,idx) =>{
						if(idx  === index){
							chk.checked = true;
						}
					});
				}
			});
		})
	}
	}
	ngAfterContentChecked(): void {
		this.cd.detectChanges();
	}
}

@Pipe({ name: 'highlight' })
export class HighlightPipe implements PipeTransform {
	transform(text: string, search): string {
		if (search) {
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
		}else{
			return text;
		}
	}
}
