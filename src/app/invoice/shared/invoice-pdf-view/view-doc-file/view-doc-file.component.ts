import { InvoiceBuilderEnumURLs } from '@appDir/front-desk/masters/builder-invoice/invoice-builder-enum-urls';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { environment } from 'environments/environment';
import { SelectionModel } from '@angular/cdk/collections';
import { Component, Input, OnInit } from '@angular/core';
import { Page } from '@appDir/front-desk/models/page';
import { StorageData, HttpSuccessResponse } from '@appDir/pages/content-pages/login/user.class';

@Component({
  selector: 'app-view-doc-file',
  templateUrl: './view-doc-file.component.html',
  styleUrls: ['./view-doc-file.component.scss']
})
export class ViewDocFileComponent implements OnInit {
  selection = new SelectionModel<Element>(true, []);
  @Input() invoice_to_label:'';
  @Input() invoiceId:''
  @Input() invoice_to_Details_all:any[]=[];
  @Input() loadSpin: boolean = false;
  page: Page = new Page();
  totalRows: number;
  environment = environment;
  constructor(private storageData: StorageData,
	private requestService:RequestService
	) {
    this.page.pageNumber = 1;
		this.page.size = 10;
    
   }


  ngOnInit(){
  }
  masterToggle(event) {
    console.log(this.selection);
    this.isAllSelected()
      ? this.selection.clear()
      : this.invoice_to_Details_all.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
  }

  isAllSelected() {
    this.totalRows = this.invoice_to_Details_all.length;
    const numSelected = this.selection.selected.length;
    const numRows = this.totalRows;
    return numSelected === numRows;
  }
  changeDocumentPageNumber(event) {}
  onViewClick(){
	debugger;
    let strParams = ''
    const selected = this.selection.selected;
    const ids = selected.map((row)=>row.id);
    for(var i = 0; i < ids.length; i++){
      if(strParams.length > 0 &&  i > 0){
        strParams += '&locationIDs[]='+ids[i];  
      }else{
        strParams += 'locationIDs[]='+ids[i];
      }
    }
    this.getInvoiceLink(null,strParams,selected)
  }

  getInvoicePdfLink(params){
	this.requestService
			  .sendRequest(
				InvoiceBuilderEnumURLs.Invoice_builder_get_pdf,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				params
			  )
			  .subscribe(
				(res: HttpSuccessResponse) => {
					if (res && res.result && res.result.data && res.result.data.pre_signed_url){
				  		window.open(res.result.data.pre_signed_url);
					}
				},
				(err) => {
				
				}); 
  }
  getInvoiceLink(row?,strParams?,selected?:any[]) {
    let link1;
	let params;
    if(row){
		params = {
			invoice_id:this.invoiceId,
			invoice_to_label:this.invoice_to_label,
			locationIDs:[row.id]
		}
			this.getInvoicePdfLink(params);
    }else{
		if (selected && selected.length===1){
			params = {
				invoice_id:selected[0]['invoice_id'],
				invoice_to_label:selected[0]['invoice_to_label'],
				locationIDs:[selected[0]['id']]
			};
			this.getInvoicePdfLink(params);
		}
		else {
			link1 = `${this.environment.fd_api_url}invoice/get/pdf?${strParams}&invoice_id=${this.invoiceId}&invoice_to_label=${this.invoice_to_label}`;
			window.open(this.getLinkwithAuthToken(link1));
		}
     
    }
	}
  getLinkwithAuthToken(link) {
		let token = this.storageData.getToken()
		if (token) {
			return `${link}&token=${token}`
		}
		else { return link }
	}
}
