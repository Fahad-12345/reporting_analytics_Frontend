import { changeDateFormat } from '@appDir/shared/utils/utils.helpers';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DateFormatEnum } from './enum/date-format.Enum';

@Component({
  selector: 'app-mat-date-picker-sharedable',
  templateUrl: './mat-date-picker-sharedable.component.html',
  styleUrls: ['./mat-date-picker-sharedable.component.scss']
})
export class MatDatePickerSharedableComponent implements OnInit,OnChanges {
	dateForm: FormGroup;
	DateFormat = DateFormatEnum.Date_Format;
	@Output() valueChange = new EventEmitter();
	@Output() onClick = new EventEmitter();
	@Input() lableName: string;
	@Input() min: Date= new Date('1900/01/01');
	@Input() max: Date=null;
	@Input() placeholder: string='';
	@Input() defaultDate: Date;
	@Input() disabled: boolean;
	@Input() classesName: string[] = [];
	classes: string;
  constructor(private fb: FormBuilder) {
	this.initializeSearchForm();
   }

  ngOnInit() {
	this.classes = this.classesName.join(' ');
	if (this.disabled){
	this.dateForm.disable();
	}

  }
  ngOnChanges(changes: SimpleChanges) {
		if( changes.defaultDate && changes.defaultDate.currentValue )
		{
			this.setValue(this.defaultDate)
		}
		
		

}
  initializeSearchForm() {
	this.dateForm = this.fb.group({
		dateControl: [null,[
			Validators.pattern('^(0[1-9]|[1-2][0-9]|3[0-1])/(0[1-9]|1[0-2])/[0-9]{4}$'),
			Validators.maxLength(10),
		]],
	});
}

setValue(value)
{
	this.dateForm.patchValue({
		dateControl:changeDateFormat(value)
	})
}

changeDate()
{
	this.valueChange.emit({
		dateValue: this.dateForm.get('dateControl').value,
	});

}
onClose()
{
	if(!this.disabled)
	{
		this.dateForm.reset();
		this.valueChange.emit({
			dateValue: this.dateForm.get('dateControl').value,
		});
	}
	
}
onClickControl(event)
{
	this.onClick.emit(event)
}

}
