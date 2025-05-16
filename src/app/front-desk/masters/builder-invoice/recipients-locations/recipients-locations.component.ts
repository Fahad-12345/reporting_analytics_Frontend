import { Component, Input, AfterViewInit, OnInit, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-recipients-locations',
  templateUrl: './recipients-locations.component.html',
  styleUrls: ['./recipients-locations.component.scss']
})
export class RecipientsLocationsComponent  implements OnInit  {
@Output() removeLocation = new EventEmitter();
@Input() invoiceToDetailsData:any=[];
@Input() item:any={};

ngOnInit(): void {
}


removeRecipient(item:any){
  let findIndex=this.invoiceToDetailsData.findIndex(location=>location?.id==item?.id);
  item.index=findIndex
  this.removeLocation.emit(item)
}

}
