import { getIdsFromArray } from '@appDir/shared/utils/utils.helpers';
import { Component, OnInit, Input, ElementRef, ViewChild, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { moveItemInArray, CdkDragDrop } from '@angular/cdk/drag-drop';
const speed = 10;
import { applyDrag, generateItems } from "./utils";



@Component({
  selector: 'app-customize-column',
  templateUrl: './customize-columns-component.html',
  styleUrls: ['./customize-columns-component.scss']
})
export class CustomizeColumnComponent implements OnInit {
  @Input() modalCols = [];
  @Input() modalColsSent = [];
  @Input() verificationSent;
  @ViewChild('scrollMe') private myScrollContainer: ElementRef;
  @Output() event = new EventEmitter<any>();
  @Output() eventSent = new EventEmitter<any>();
  @Output() singleSelection = new EventEmitter<any>();
  @Output() singleSelectionSent = new EventEmitter<any>();
  checkBoxChecked: boolean = false;
  checkBoxSentChecked: boolean = false;
  public sourceAttributesCollection: Array<any> = generateItems(20, i => ({
    id: i,
    data: `Source - ${i}`,
    currentSource: "default"
  }));

 

  ngOnInit() {
  }

  scrollToTop(): void {
    try {
      this.myScrollContainer.nativeElement.scrollTop = 0;
    } catch (err) { }
  }

  public getChildPayloadAttributesCollection(index) {
    return this.sourceAttributesCollection[index];
  }

  public onDrop(dropResult: any) {
    this.sourceAttributesCollection = applyDrag(
      this.sourceAttributesCollection,
      dropResult
    );
  }

  
  ngOnChanges(changes: SimpleChanges) {
    let isAllTrue = getIdsFromArray(this.modalCols, 'checked').every(v => (v === true || v === 1));
    let isAllTrueSent = getIdsFromArray(this.modalColsSent, 'checked').every(v => (v === true || v === 1));
    isAllTrue && this.modalCols.length ? this.checkBoxChecked = true : this.checkBoxChecked = false;
    isAllTrueSent && this.modalColsSent.length ? this.checkBoxSentChecked = true : this.checkBoxSentChecked = false;
    setTimeout(() => {
      this.scrollToTop();
    }, 300);
  }

  toggleModal(col, event) {
    col['checked'] = event.target.checked;
    let isAllTrue = this.modalCols.every(v => (v?.checked === true || v?.checked === 1));
    let isAllFalse = this.modalCols.every(v => (v?.checked === false || v?.checked === 0));
    this.singleSelection.emit(isAllFalse);
    if (isAllTrue) {
      this.checkBoxChecked = true;
    } else {
      this.checkBoxChecked = false;
    }
  }
  
  toggleModalSent(col, event) {
    col['checked'] = event.target.checked;
    let isAllTrue = this.modalColsSent.every(v => (v?.checked === true || v?.checked === 1));
    let isAllFalse = this.modalColsSent.every(v => (v?.checked === false || v?.checked === 0));
    this.singleSelectionSent.emit(isAllFalse);
    if (isAllTrue) {
      this.checkBoxSentChecked = true;
    } else {
      this.checkBoxSentChecked = false;
    }
  }

  dragLeave(event) {

  }

  toggleModalMaster(event) {
    this.event.emit(event.target.checked)
    this.modalCols.forEach(col => {
      col['checked'] = event.target.checked;
    });
  }
  
  toggleModalMasterSent(event) {
    this.eventSent.emit(event.target.checked)
    this.modalColsSent.forEach(col => {
      col['checked'] = event.target.checked;
    });
  }

  onDropScroll(dropResult) {
    this.modalCols = applyDrag(this.modalCols, dropResult);
  }

  onDropScrollSent(dropResult) {
    this.modalColsSent = applyDrag(this.modalColsSent, dropResult);
  }

  drop(event: CdkDragDrop<any[]>) {
    moveItemInArray(this.modalCols, event.previousIndex, event.currentIndex);
  }

  identifyByHeader(index, item) {
    return item.header;
  }
}
