import { Component, OnDestroy, OnInit } from '@angular/core';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Location } from '@angular/common';
import { Page } from '@appDir/front-desk/models/page';
import { OrderEnum, ParamQuery } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { AclService } from '@appDir/shared/services/acl.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { RequestService } from '@appDir/shared/services/request.service';
import { Title } from '@angular/platform-browser';
import { Subject, Subscription } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { EnumApiPath } from '@appDir/front-desk/billing/Models/searchedKeys-modal';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { checkReactiveFormIsEmpty, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { AddUpdatePayersComponent } from './add-update-payers/add-update-payers.component';
import { ClearinghouseEnum } from './CH-helpers/clearinghouse';
import { ScrollToConfigOptions, ScrollToService } from '@nicky-lenaers/ngx-scroll-to';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';
import { SelectDefaultPayerComponent } from './select-default-payer/select-default-payer.component';
import { CreatedHistoryComponent } from '@appDir/shared/created-history/created-history.component';
@Component({
  selector: 'app-clearinghouse',
  templateUrl: './clearinghouse.component.html',
  styleUrls: ['./clearinghouse.component.scss']
})

export class ClearinghouseComponent extends PermissionComponent implements OnInit, OnDestroy {
  page: Page;
  queryParams: ParamQuery;
  loadSpin: boolean = false;
  subscription: Subscription[] = [];
  clearinghouseFilterForm: FormGroup;
  isCollapsed = false;
  EnumApiPath = EnumApiPath;
  requestServerpath = REQUEST_SERVERS;
  showform: boolean = false;
  lstClearinghouse = [];
  clearinghouse: any;
  result = 'No data to display';
  eventsSubject: Subject<any> = new Subject<any>();
  hideAddButton: boolean = true;
  chIndex: any;
  constructor(
    private modalService: NgbModal,
    private location: Location,
    aclService: AclService, router: Router,
    private toaster: ToastrService,
    protected requestService: RequestService,
    private _route: ActivatedRoute,
    private _scrollToService: ScrollToService,
    titleService: Title,
    private customDiallogService: CustomDiallogService,
    private fb: FormBuilder) {
    super(aclService, router, _route, requestService, titleService);
    this.page = new Page();
    this.page.pageNumber = 0;
    this.page.size = 10;
  }
  ngOnInit() {
    this.setTitle();
    this.initFilterForm();
    this.setPage({ offset: this.page.pageNumber - 1 || 0 });
  }
  addUrlQueryParams(params?) {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params }).toString()
    );
  }
  pageLimit($num) {
    this.page.size = Number($num);
    this.setPage({ offset: 0 });
  }
  initFilterForm() {
    this.clearinghouseFilterForm = this.fb.group({
      clearing_house_ids: [[]],
      payer_ids: [[]],
      insurance_ids: [[]],
      states_ids: [[]],
    })
  }
  setPage(pageInfo, extendreord?) {
    if (extendreord) { this.chIndex = null }
    this.page.pageNumber = pageInfo.offset;
    const pageNumber = this.page.pageNumber + 1;
    this.page.pageNumber = pageNumber;
    const filters = checkReactiveFormIsEmpty(this.clearinghouseFilterForm);
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size || 10,
      page: pageNumber,
      pagination: true,
    };
    this.addUrlQueryParams({
      per_page: this.page.size || 10,
      page: pageNumber || 1
    })
    this.GetClearinghouseList({ ...this.queryParams, ...filters });
  }
  GetClearinghouseList(queryParams?) {
    this.loadSpin = true;
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Add_Update_Clearinghouse, 'get', REQUEST_SERVERS.fd_api_url, { ...queryParams })
        .subscribe((res) => {
          this.loadSpin = false;
          this.lstClearinghouse = res && res['result'] && res['result']['data'] ? res['result']['data'] : [];
          this.page.totalElements = res && res['result'] && res['result']['total'] ? res['result']['total'] : 0;
          if (this.chIndex || this.chIndex == 0) {
            this.toggleInsuranceCardDetail(this.chIndex);
          }
        })
    )
  }
  clearinghousePageLimit($num, $event) {
    this.page.pageNumber = 0
    this.page.totalElements = 0;
    this.page.totalPages = 0;
    this.page.size = Number($num);
    this.pageChanged($event, 'clearinghouse')
  }
  togglePayerInfo(index) {
    if (!this.lstClearinghouse[index]['isOpen']) {
      this.lstClearinghouse[index]['isOpen'] = true;
    } else {
      this.lstClearinghouse[index]['isOpen'] = false;
    }
  }
  setPayersPageLimit(clearinghouse, event) {
    clearinghouse['pageLimit'] = Number(event.target.value);
  }
  addUpdateClearinghouseInfo() {
    this.chIndex = null;
    this.showform = !this.showform;
    this.hideAddButton = false;
    this.clearinghouse = null;
  }
  selectionOnValueChange(e: any, Type?) {
    if (e && e.data) {
      this.clearinghouseFilterForm.controls[Type].setValue(e.formValue);
    } else {
      this.clearinghouseFilterForm.controls[Type].setValue(null)
    }
  }
  pageChanged(event, param?) {
    if (param == 'clearinghouse') {
      this.setPage({ offset: 0 }, true);
    } else {
      event.itemsPerPage = this.page.size;
      this.setPage({ offset: event.page - 1 });
    }

  }
  toggleInsuranceCardDetail(index) {
    if (!this.lstClearinghouse[index]['isOpen']) {
      this.lstClearinghouse[index]['isOpen'] = true;
    } else {
      this.lstClearinghouse[index]['isOpen'] = false;
    }
  }
  AddUpdatePayersInfo(payer_id: string, clearing_house: any, index) {
    this.chIndex = index;
    let updatePayerModalRef = this.modalService.open(AddUpdatePayersComponent, {
      size: 'xl',
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc body-scroll add-payer-modal',
    });
    if (payer_id) {
      updatePayerModalRef.componentInstance.payer_id = payer_id;
      updatePayerModalRef.componentInstance.payer_log = 'payer_update_by_id';
      updatePayerModalRef.result.then(payer => {
        if (payer) {
          this.setPage({ offset: this.page.pageNumber - 1 });
        }
      })
    } else if (clearing_house) {
      updatePayerModalRef.componentInstance.clearing_house = clearing_house;
      updatePayerModalRef.componentInstance.payer_log = 'payer_added_in_CH';
      updatePayerModalRef.result.then(payer => {
        if (payer)
          this.setPage({ offset: this.page.pageNumber - 1 });
      })
    }

  }
  getEmitData(event) {
    this.showform = false;
    if (event && event.length) {
      this.eventsSubject.next(true);
      this.clearinghouseFilterForm.reset();
      this.setPage({ offset: this.page.pageNumber ? (this.page.pageNumber - 1) : 0 });
      this.hideAddButton = true;
    } else {
      this.hideAddButton = true;
    }
  }
  public triggerScrollTo(target) {
    const config: ScrollToConfigOptions = {
      target: target,
      duration: 200,
      easing: 'easeOutElastic',
      offset: 0
    };
    setTimeout(() => {
      this._scrollToService.scrollTo(config);
    }, 100);
  }
  UpdateClearinghouse(clearinghouse) {
    this.showform = true;
    if (clearinghouse) {
      this.hideAddButton = false;
      this.clearinghouse = { ...clearinghouse }
    }
  }
  resetFilters() {
    this.chIndex = null;
    this.addUrlQueryParams();
    this.eventsSubject.next(true);
    this.clearinghouseFilterForm.reset();
    this.clearinghouseFilterForm.markAsTouched();
    this.setPage({ offset: 0 });
  }
  deletePayer(id, row, index) {
    this.chIndex = index;
    if(row?.associated_case?.length){
      let case_list = row?.associated_case?.map(obj => obj?.case_id);
      case_list = [...new Set(case_list)];
      case_list = case_list.join(' ,');
      this.toaster.error(`This payer have already attached with Case ID(s) ${case_list}. Please remove those Case(s) first!`)
    }
    else if (row?.insurance_location?.length) {
      this.subscription.push(
        this.requestService.sendRequest(
          ClearinghouseEnum.Get_Payers_Info, 'delete', REQUEST_SERVERS.fd_api_url, { id: [id] })
          .subscribe((res) => {
            if (res && res['status']) {
              if (res['flag']) {
                this.customDiallogService.confirm('Delete Confirmation?', res['message'], 'Yes', 'No')
                  .then((confirm) => {
                    if (confirm) {
                      this.subscription.push(
                        this.requestService.sendRequest(
                          ClearinghouseEnum.Get_Payers_Info, 'delete', REQUEST_SERVERS.fd_api_url, { id: [id], force: true })
                          .subscribe((resp) => {
                            if (resp && resp['status'] && resp['result']['data'].length) {
                              let selecDefaultPayerRef = this.modalService.open(SelectDefaultPayerComponent, {
                                size: 'xl',
                                backdrop: 'static',
                                keyboard: false,
                                windowClass: 'modal_extraDOc body-scroll add-payer-modal',
                              });
                              selecDefaultPayerRef.componentInstance.defaultPayerInfo = [...resp['result']['data']];
                              selecDefaultPayerRef.result.then((res) => {
                                this.setPage({ offset: this.page.pageNumber - 1 });
                                this.toaster.success('Payer deleted successfully.', 'Success');
                              });
                            } else {
                              this.setPage({ offset: this.page.pageNumber - 1 });
                              this.toaster.success(resp['message'], 'Success');
                            }
                          })
                      )
                    }
                  })
              } else {
                this.setPage({ offset: this.page.pageNumber - 1 });
                this.toaster.success(res['message'], 'Success');
              }
            }
          })
      )
    } else {
      this.customDiallogService.confirm('Delete Confirmation?', 'Are you sure? This action will delete the selected payer.', 'Yes', 'No')
        .then((confirmed) => {
          if (confirmed) {
            this.subscription.push(
              this.requestService.sendRequest(
                ClearinghouseEnum.Get_Payers_Info, 'delete', REQUEST_SERVERS.fd_api_url, { id: [id] })
                .subscribe((res) => {
                  if (res && res['status']) {
                    this.setPage({ offset: this.page.pageNumber - 1 });
                    this.toaster.success('Payer Deleted Successfully.', 'Success');
                  }
                }
                ))
          }
        })
        .catch();
    }
  }
  getPayerInfo(clearing_house_ids, index) {
    let payers = [];
    this.subscription.push(
      this.requestService.sendRequest(
        ClearinghouseEnum.Get_Payers_Info, 'get', REQUEST_SERVERS.fd_api_url, { clearing_house_ids: [clearing_house_ids] })
        .subscribe((res) => {
          this.loadSpin = false;
          if (res && res['result'] && res['result']['data']) {
            payers = res && res['result'] && res['result']['data'] ? res['result']['data'] : [];
            this.lstClearinghouse[index]['payers'] = res && res['result'] && res['result']['data'] ? res['result']['data'] : [];
          }
        }, (err) => {
          this.loadSpin = false;
        })
    )
    return payers;
  }
  billingHistoryStats(row) {
		const ngbModalOptions: NgbModalOptions = {
			backdrop: 'static',
			keyboard: false,
			windowClass: 'modal_extraDOc body-scroll history-modal',
			modalDialogClass: 'modal-lg'
		};
		let modelRef = this.modalService.open(CreatedHistoryComponent, ngbModalOptions);
		modelRef.componentInstance.createdInformation = [row];
	}
}
