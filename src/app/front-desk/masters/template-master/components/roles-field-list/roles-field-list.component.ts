import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Page } from '@appDir/front-desk/models/page';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { DatePipe, Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { RequestService } from '@appDir/shared/services/request.service';
import { TemplateMasterUrlEnum } from '../../template-master-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { FacilityModel, SpecialityModel } from './Roles.model'
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { SpecialityModalComponent } from '../speciality-modal/speciality-modal.component';
import { MainServiceTemp } from '../header-footer/services/main.service';
import { Subscription } from 'rxjs';
import { checkReactiveFormIsEmpty, isObjectEmpty, unSubAllPrevious, isEmptyObject } from '@appDir/shared/utils/utils.helpers';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';

@Component({
  selector: 'app-roles-field-list',
  templateUrl: './roles-field-list.component.html',
  styleUrls: ['./roles-field-list.component.scss']
})
export class RolesFieldListComponent implements OnInit,OnDestroy {


  constructor(private mainServiceTemplate:MainServiceTemp,private fb: FormBuilder, private location: Location, private router: Router,private datePipe: DatePipe,
    public datePipeService:DatePipeFormatService,
    private modalService: NgbModal,
	 private requestService: RequestService, private modal: NgbModal,private _route: ActivatedRoute) {
		this.page = new Page();
		this.page.size = 10;
		this.page.pageNumber = 1;
	  }

  filterForm: FormGroup
  page: Page = new Page()
  queryParams: ParamQuery
  minDate = new Date('1900/01/01');
//   lstRoles: RolesModel[] = [];
  lstFacility:any[]=[];
  subscription: Subscription[] = [];
  loadSpin = false;
  DATEFORMAT = '_/__/____';

  ngOnInit() {
    this.filterForm = this.fb.group({
      location_name: '',
      specialty_name: '',
      created_by_name:'',
      updated_by_name:'',
      visit_type_name: '',
      field_control_name: '',
      created_at:'',
      updated_at:'',
      
    })

    this.subscription.push(
      this.filterForm.get('created_at').valueChanges.subscribe(value => {
        this.filterForm.get('created_at').setValue(this.datePipe.transform(value, 'yyyy-MM-dd'), { emitEvent: false });
      })
    )
  
    this.subscription.push (
      this.filterForm.get('updated_at').valueChanges.subscribe(value => {
        this.filterForm.get('updated_at').setValue(this.datePipe.transform(value, 'yyyy-MM-dd'), { emitEvent: false });
      })
    )

	this.subscription.push(
		this._route.queryParams.subscribe((params) => {
			
			this.page.size = parseInt(params.per_page) || 10;
			this.page.pageNumber = parseInt(params.page) || 1;
		}),
	);

    this.setPage({ offset: this.page.pageNumber - 1 || 0 })
  }
  ngOnDestroy()
  {
	unSubAllPrevious(this.subscription);
  }

  setPage(pageInfo) {
    let pageNum;
    // this.selection.clear();
    pageNum = pageInfo.offset;
    this.page.pageNumber = pageInfo.offset;
    const pageNumber = this.page.pageNumber + 1;
    let filters = checkReactiveFormIsEmpty(this.filterForm);
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size,
      page: pageNumber,
      pagination: false,
    };
    let per_page = this.page.size;
    let queryparam = { per_page, page: pageNumber }

    this.addUrlQueryParams({ ...filters, ...queryparam });
    this.getFacilityLocation({ ...this.queryParams, ...filters });

  }
  addUrlQueryParams(params?) {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params, }).toString()
    );
  }
  pageChanged(event) {
  }

  getFacilityLocation(params)
  {
	this.loadSpin = true;
	this.requestService.sendRequest(TemplateMasterUrlEnum.Facility_list_dropdown_GET, 'get', REQUEST_SERVERS.fd_api_url, { ...params }).subscribe(data => {
		this.loadSpin = false;
		this.lstFacility = data['result']['data']
		this.page.totalElements = data['result']['total']
	  },(error) => {
		this.loadSpin = false;
	  })
  }
  toggleOpen(row: FacilityModel) {
    if (row.is_open == null) {
      row.is_open = false
    }
    row.is_open = !row.is_open

    if (row.is_open) {
      this.getFacilitySpeciality(row)
    }
  }

  getFacilitySpeciality(row: any) {
	let queryParams:any={
		facility_location_ids:[row.id]
	}
    this.requestService.sendRequest(TemplateMasterUrlEnum.getFacilitySpeciality, 'get', REQUEST_SERVERS.fd_api_url, queryParams).subscribe(data => {
      row._specialities = []
      let arr: SpecialityModel[] = data['result']['data']
      row.specialities = arr
      arr.forEach(speciality => {
        if (speciality.visit_types.length > 0) {
          speciality.visit_types.forEach(visittype => {
            let _speciality: SpecialityModel = { ...speciality, visit_types: [visittype] }
            row._specialities.push(_speciality)
          })

        } else {
          row.specialities = arr
        }
      })
      // row.specialities = data['result']['data']
    })
  }
  edit(row) {
    this.router.navigate([`/front-desk/masters/template/template/roles-field/edit/${row.id}`])
  }
  pageLimit(size) {
    this.page.size = size
    this.setPage(this.page)
  }
  editVisitType(row, role) {
    let modalRef = this.modal.open(SpecialityModalComponent)
    modalRef.componentInstance.speciality = row
    modalRef.componentInstance.role = role
    modalRef.result.then(() => {
      this.setPage(this.page)
    })
  }
  checkInputs() {
	if (isEmptyObject(this.filterForm.value)) {
		return true;
	  }
	  return false;
}

requireFieldHistoryStats(row) {
  const ngbModalOptions: NgbModalOptions = {
    backdrop: 'static',
    keyboard: false,
    windowClass: 'modal_extraDOc body-scroll history-modal',
    modalDialogClass: 'modal-lg'
  };
  let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
  modelRef.componentInstance.createdInformation = [row];
}
}
