import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Page } from '@appDir/front-desk/models/page';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { checkReactiveFormIsEmpty, getIdsFromArray, isObjectEmpty, makeDeepCopyArray } from '@appDir/shared/utils/utils.helpers';
import { Location } from '@angular/common';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';
import { AddEditEmployerInsuranceLinkComponent } from './add-edit-employer-insurance-link/add-edit-employer-insurance-link.component';
import { EmpInsuLinkageEnum } from './emp-insu-linkage';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { Subject } from 'rxjs';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { DatatableComponent } from '@swimlane/ngx-datatable';
import { CustomizeColumnComponent } from '@appDir/shared/components/customize-columns-component/customize-columns-component';
import { LocalStorage } from '@appDir/shared/libs/localstorage';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { findIndexInData } from '@appDir/shared/modules/ngx-datatable-custom/utils/common-functions';

@Component({
  selector: 'app-emp-insu-linkage',
  templateUrl: './emp-insu-linkage.component.html',
  styleUrls: ['./emp-insu-linkage.component.scss']
})
export class EmpInsuLinkageComponent extends PermissionComponent implements OnInit, AfterViewInit {
  loadSpin: boolean = false;
  page: Page;
  searchForm: FormGroup;
  queryParams: ParamQuery;
  selection = new SelectionModel<Element>(true, []);
  emplInsurData: any[] = [];
  totalRows: number;
  EnumApiPath = EnumApiPath;
  requestServerpath = REQUEST_SERVERS;
  eventsSubject: Subject<any> = new Subject<any>();
  @ViewChild('CustomizeColumnModal') CustomizeColumnModal :ModalDirective;
	@ViewChild('empInsLinkageList') empInsLinkageListTable: DatatableComponent;
	customizedColumnComp: CustomizeColumnComponent;
	@ViewChild(CustomizeColumnComponent) set con(con: CustomizeColumnComponent) {
		if (con) { // initially setter gets called with undefined
		  this.customizedColumnComp = con;
		}
	}
	modalCols :any[] = [];
	columns: any[] = [];
	alphabeticColumns:any[] =[];
	colSelected: boolean = true;
	isAllFalse: boolean = false;
	empInsLinkageListtingTable: any;


  constructor(
    private fb: FormBuilder, 
    private location: Location, 
    private toastrService: ToastrService, 
    private modalService: NgbModal, 
    aclService: AclService, 
    protected requestService: RequestService,
    private _route: ActivatedRoute, 
    public datePipeService: DatePipeFormatService, 
    private customDiallogService: CustomDiallogService, 
    router: Router, 
    titleService: Title,
    private storageData: StorageData,
		private localStorage: LocalStorage
    ) {
    super(aclService, router, _route, requestService, titleService);
    this.page = new Page();
    this.page.size = 10;
    this.page.pageNumber = 1;
  }


  ngOnInit() {
    this.searchForm = this.initializeSearchForm();
    this.setPage({ offset: this.page.pageNumber - 1 || 0 });
    this.empInsLinkageListtingTable = this.localStorage.getObject('empInsLinkageTableList' + this.storageData.getUserId());
  }

  ngAfterViewInit() {
		if (this.empInsLinkageListTable?._internalColumns) {
			this.columns = makeDeepCopyArray([...this.empInsLinkageListTable._internalColumns]);
			this.columns.forEach(element => {
				if(this.empInsLinkageListtingTable.length) {
					let obj = this.empInsLinkageListtingTable.find(x => x?.header === element?.name);
					obj ? element['checked'] = true : element['checked'] = false;
				}
				else {
					element['checked'] = true;
				}
			});
			if(this.empInsLinkageListtingTable.length) {
				const nameToIndexMap = {};
				this.empInsLinkageListtingTable.forEach((item, index) => {
					nameToIndexMap[item?.header] = index;
				});
				this.columns.sort((a, b) => nameToIndexMap[a?.name] - nameToIndexMap[b?.name]);
			}
			let columns = makeDeepCopyArray(this.columns);
			this.alphabeticColumns = columns.sort(function (a, b) {
				if (a.name < b.name) { return -1; }
				if (a.name > b.name) { return 1; }
				return 0;
			});
			this.onConfirm(false);
		}
	}

  initializeSearchForm(): FormGroup {
    return this.fb.group({
      insurance_ids: [[]],
      employer_ids: [[]]
    })
  }

  resetFilter() {
    const filters = checkReactiveFormIsEmpty(this.searchForm);
    if (!isObjectEmpty(filters)) {
      this.searchForm.reset();
      this.eventsSubject.next(true);
      this.setPage({ offset: 0 });
    }
  }

  onResultPerPageChange(event) {
    this.page.size = event.target.value;
    this.setPage({ offset: 0 });
  }

  setPage(pageInfo: any): void {
    this.selection.clear();
    this.page.pageNumber = pageInfo.offset;
    const pageNumber = this.page.pageNumber + 1;
    const filters = checkReactiveFormIsEmpty(this.searchForm);
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size || 10,
      page: pageNumber,
      pagination: true,
    };
    let per_page = this.page.size;
    let queryParam = { per_page, page: pageNumber };
    this.addUrlQueryParams(queryParam);
    this.displayGetAllEmpInsLiknages({ ...this.queryParams, ...filters });
  }

  valueSelectionChange(ev, formControl) {
    if (ev && ev['data']) {
      this.searchForm.controls[formControl].setValue(ev.formValue);
    }
  }

  addUrlQueryParams(params?) {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params }).toString()
    );
  }

  isAllSelected(): boolean {
    this.totalRows = this.emplInsurData.length;
    const numSelected = this.selection.selected.length;
    const numRows = this.totalRows;
    return numSelected === numRows;
  }

  /**
   * Invoke isCaseStatusAllSelected method and perform operation its return value
   * @param void
   * @returns void
   */
  masterToggle(): void {
    this.isAllSelected()
      ? this.selection.clear()
      : this.emplInsurData.slice(0, this.totalRows).forEach((row) => this.selection.select(row));
  }

  displayGetAllEmpInsLiknages(queryParams: any): void {
    this.loadSpin = true;
    this.subscription.push(
      this.requestService
        .sendRequest(
          EmpInsuLinkageEnum.Emp_Insu_Linkage,
          'GET',
          REQUEST_SERVERS.fd_api_url,
          queryParams,
        )
        .subscribe(
          (data: any) => {
            if (data.status) {
              this.loadSpin = false;
              this.emplInsurData = data.result ? data.result.data : [];
              this.page.totalElements =
                data && data.result && data.result.total ? data.result.total : 0;
              this.page.totalPages = this.page.totalElements / this.page.size;
            }
          },
          (err) => {
            this.loadSpin = false;
          },
        ),
    );
  }

  AddUpdateLinkage(linkagedata?) {
    let empInsuLinkModel = this.modalService.open(AddEditEmployerInsuranceLinkComponent, {
      size: 'md',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc',
    });
    if (linkagedata) {
      empInsuLinkModel.componentInstance.employer_Insurance_data = linkagedata;
      empInsuLinkModel.componentInstance.employer_Insurance_id = linkagedata['id'];
    }
    empInsuLinkModel.result.then((res) => {
      if (res == 'update') {
        this.setPage({ offset: this.page.pageNumber -1 });
      }else if(res == 'add'){
        this.searchForm.reset();
        this.eventsSubject.next(true);
        this.setPage({ offset: this.page.pageNumber -1 });
      }
    });
  }

  changeLinkStatuses(ev: MatSlideToggleChange, row) {
    this.loadSpin = true;
    let bodyObj = {
      employer_insurance_links: [
        {
          id: row.id,
          is_active: ev.checked
        }
      ]
    }
    this.UpdateLinkage(bodyObj);
  }

  UpdateLinkage(paramBody) {
    this.subscription.push(
      this.requestService.sendRequest(
        EmpInsuLinkageEnum.Emp_Insu_Linkage, 'put', REQUEST_SERVERS.fd_api_url, { ...paramBody })
        .subscribe((res) => {
          if (res && res['result'] && res['result']['data']) {
            this.setPage({ offset: this.page.pageNumber -1 });
            this.toastrService.success('Status updated successfully', 'Success');
          }
        })
    )
  }

  ActiveOrInactiveLink(active) {
    this.loadSpin = true;
    let employer_insurance_links = this.selection?.selected?.map((linkage) => {
      return {
        id: linkage.id,
        is_active: active
      }
    });
    let bodyObj = {
      employer_insurance_links: [...employer_insurance_links]
    }
    this.UpdateLinkage(bodyObj);
  }

  deleteLinkage(id, single) {
    let plural = single?'.':'s.'
    this.customDiallogService.confirm('Delete Confirmation?', `Are you sure? This action will delete the selected link${plural}`, 'Yes', 'No')
      .then((confirmed) => {
        if (confirmed) {
          if (single) {
            this.LinkageDeletion({ ids: [id] });
          }
          else {
            let employer_insurance_links = this.selection?.selected?.map((linkage) => linkage.id);
            this.LinkageDeletion({ ids: [...employer_insurance_links] });
          }
        }
        else {
          if(!single){
            this.setPage({ offset: this.page.pageNumber -1 });
          }
        }
      })
      .catch();
  }

  LinkageDeletion(body) {
    this.subscription.push(
      this.requestService.sendRequest(
        EmpInsuLinkageEnum.Emp_Insu_Linkage, 'delete', REQUEST_SERVERS.fd_api_url, { ...body })
        .subscribe((res) => {
          if (res && res['result'] && res['result']['data']) {
            this.setPage({ offset: this.page.pageNumber -1 });
            this.toastrService.success('Deleted successfully', 'Success');
          }
        })
    )
  }

  insLinkageHistoryStats(row) {
		console.log(row,'row in case list')
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent,ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}

  openCustomoizeColumn(CustomizeColumnModal) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal-lg-package-generate',
		};
		this.modalCols = [];
		let self = this;
		this.columns.forEach(element => {
			let obj = self.alphabeticColumns.find(x => x?.name === element?.name);
			if(obj) {
				this.modalCols.push({ header: element?.name, checked: obj?.checked });
			}
		});
		this.CustomizeColumnModal.show();
	}

	onConfirm(click) {
		if (this.isAllFalse && !this.colSelected){
			this.toastrService.error('At Least 1 Column is Required.','Error');
			return false;
		}
		if(click) {
			this.customizedColumnComp;
			this.modalCols = makeDeepCopyArray(this.customizedColumnComp?.modalCols)
			let data: any = [];
			this.modalCols.forEach(element => {
				if(element?.checked) {
					data.push(element);
				}
				let obj = this.alphabeticColumns.find(x => x?.name === element?.header);
				if (obj) {
					if (obj.name == element.header) {
						obj.checked = element.checked;
					}
				}
			});
			this.localStorage.setObject('empInsLinkageTableList' + this.storageData.getUserId(), data);
		}
		let groupByHeaderCol = getIdsFromArray(this.modalCols, 'header'); // pick header
		this.columns.sort(function (a, b) {
			return groupByHeaderCol.indexOf(a.name) - groupByHeaderCol.indexOf(b.name);
		});
		//set checked and unchecked on the base modal columns in alphabeticals columns
		this.alphabeticColumns.forEach(element => {
		let currentColumnIndex = findIndexInData(this.columns, 'name', element.name)
			if (currentColumnIndex != -1) {
				this.columns[currentColumnIndex]['checked'] = element.checked;
				this.columns = [...this.columns];
			}
		});
		// show only those columns which is checked
		let columnsBody = makeDeepCopyArray(this.columns);
		this.empInsLinkageListTable._internalColumns = columnsBody.filter(c => {
			return c.checked == true;
		});
		let groupByHeader = getIdsFromArray(this.modalCols, 'header'); // pick header property from alphabetical columns
		this.empInsLinkageListTable._internalColumns.sort(function (a, b) {
			return groupByHeader.indexOf(a.name) - groupByHeader.indexOf(b.name);
		});
		window.dispatchEvent(new Event('resize'));
		this.CustomizeColumnModal.hide();
	}

	onCancel() {
		this.CustomizeColumnModal.hide();
	}

	onSelectHeaders(isChecked) {
		this.colSelected = isChecked;
		if(!isChecked) {
			this.isAllFalse = true;
		}
	}

	onSingleSelection(isChecked) {
		this.isAllFalse = isChecked;
		if(isChecked) {
			this.colSelected = false;
		}
	}

}
