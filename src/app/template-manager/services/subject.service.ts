import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/internal/BehaviorSubject';
import { UI_COMPONENT_TYPES } from '../common/constants';

@Injectable({
	providedIn: 'root',
})
export class SubjectService {
	public addItem = new BehaviorSubject<any>([]);
	castItem = this.addItem.asObservable();
	public copyPasteItem = new BehaviorSubject<any>([]);
	castPasteItem = this.copyPasteItem.asObservable();
	public emptyCellClick = new BehaviorSubject<any>([]);
	castEmptyCellClick = this.emptyCellClick.asObservable();
	public tableDropdownItem = new BehaviorSubject<any>([]);
	castTableDropdownItem = this.tableDropdownItem.asObservable();
	public instanceRefresh = new BehaviorSubject<any>([]);
	castInstanceRefresh = this.instanceRefresh.asObservable();
	public hfSelect = new BehaviorSubject<any>([]);
	castHFSelect = this.hfSelect.asObservable();
	public gridRefresh = new BehaviorSubject<any>([]);
	castGridRefresh = this.gridRefresh.asObservable();
	public checkBoxRefresh = new BehaviorSubject<any>([]);
	public calculationRefresh = new BehaviorSubject<any>([]);
	public dropDownRefresh = new BehaviorSubject<any>([]);
	public imageRefresh = new BehaviorSubject<any>([]);
	public incrementRefresh = new BehaviorSubject<any>([]);
	public inputRefresh = new BehaviorSubject<any>([]);
	public intellisenseRefresh = new BehaviorSubject<any>([]);
	public intensityRefresh = new BehaviorSubject<any>([]);
	public radioRefresh = new BehaviorSubject<any>([]);
	public simpleImageRefresh = new BehaviorSubject<any>([]);
	public switchRefresh = new BehaviorSubject<any>([]);
	public textRefresh = new BehaviorSubject<any>([]);
	public signatureRefresh = new BehaviorSubject<any>([]);
	public drawingRefresh = new BehaviorSubject<any>([]);
	public livePdf = new BehaviorSubject<any>([]);

	public saveAlignment = new BehaviorSubject<any>([]);
	castSaveAlignment = this.saveAlignment.asObservable();
	public alignment = new BehaviorSubject<any>([]);
	castalignment = this.alignment.asObservable();
	public selectPre = new BehaviorSubject<any>([]);
	castSelectPre = this.selectPre.asObservable();
	public resize = new BehaviorSubject<any>([]);
	castResize = this.resize.asObservable();

	public byDefaultChange = new BehaviorSubject<any>([]);
	refreshDefaultValue = this.byDefaultChange.asObservable();

	public addAnswer = new BehaviorSubject<any>([]);
	addAnswerObservable = this.addAnswer.asObservable();
	constructor() {}
	public resizeRefreshItem(item) {
		this.resize.next(item);
	}

	public generateLivePdf(item) {
		this.livePdf.next(item);
	}
	public selectPreRefreshItem(item) {
		this.selectPre.next(item);
	}
	public selectHFItem(item) {
		this.hfSelect.next(item);
	}
	public gridRefreshItem(item) {
		this.gridRefresh.next(item);
	}
	public objectRefreshItem(item) {
		switch (item.type) {
			case UI_COMPONENT_TYPES.CHECKBOX:
				this.checkBoxRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.CALCULATION:
				this.calculationRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.DROPDOWN:
				this.dropDownRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.TABLE_DROPDOWN:
				this.dropDownRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.IMAGE_LABEL:
				this.imageRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.INCREMENT:
				this.incrementRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.INPUT:
				this.inputRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.INTELLISENSE:
				this.intellisenseRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.INTENSITY:
				this.intensityRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.RADIO:
				this.radioRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.SIMPLE_IMAGE:
				this.simpleImageRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.SWITCH:
				this.switchRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.TEXT:
				this.textRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.SIGNATURE:
				this.signatureRefresh.next(item);
				break;
			case UI_COMPONENT_TYPES.DRAWING:
				this.drawingRefresh.next(item);
				break;
		}
	}
	public refreshItem(item) {
		this.addItem.next(item);
	}
	public pasteItem(item) {
		this.copyPasteItem.next(item);
	}
	public emptyCellClickFunc(item) {
		this.emptyCellClick.next(item);
	}
	public instanceRefreshCheck(item) {
		this.instanceRefresh.next(item);
	}
	public alignmentRefresh(item) {
		this.alignment.next(item);
	}
	public tableDropdownSelection(item) {
		this.tableDropdownItem.next(item);
	}
	public selectByDefaultChange(data: any) {
		this.byDefaultChange.next(data);
	}

	public addAnswerChange(data: any) {
		this.addAnswer.next(data);
	}
}
