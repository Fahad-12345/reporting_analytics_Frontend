import { Component, OnDestroy, OnInit } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormGroup } from '@angular/forms';
import { LayoutService } from './services/layout.service';
import { HeaderFooterModalComponent } from './modals/header-footer-modal/header-footer-modal.component';
import { MainServiceTemp } from './services/main.service'
import { Page } from '@appDir/front-desk/models/page';
import { ParamQuery, OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser'
import { ToastrService } from 'ngx-toastr';
import { TemplateMasterUrlEnum } from '../../template-master-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Subscription } from 'rxjs';
import { checkReactiveFormIsEmpty, isObjectEmpty, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-header-footer',
  templateUrl: './header-footer.component.html',
  styleUrls: ['./header-footer.component.scss']
})
export class HeaderFooterComponent
 implements OnInit,OnDestroy
 {
  data = [];
  page: Page = new Page()
  queryParams: ParamQuery
  searchSections = []
  startindex: any = 0
  endindex: any = 10
  constructor(private toasterService: ToastrService,
    protected requestService: RequestService,
    protected storageData: StorageData,private _route: ActivatedRoute,
    public layoutService: LayoutService, private location: Location, private router: Router,
    private modalService: NgbModal,
    public sanitizer: DomSanitizer,
    private mainService: MainServiceTemp) {
		this.page.size = 10;
		this.page.pageNumber = 1
	}
  public counter = 10
  public isOpenFilters: any = [];
  public tags: any = [];
  pageNumber = 1;
  viewTemplateCheck = false;
  modalRef: NgbModalRef;
  title: string;
  form: FormGroup;
  buttonTitle: string;
  searchParam = "";
  subscription: Subscription[] = [];
  loadSpin = false;
  ngOnInit() {
    this.layoutService.openTemplate = false;
    let filters = checkReactiveFormIsEmpty(this.form);

	this.subscription.push(
		this._route.queryParams.subscribe((params) => {

			this.page.size = parseInt(params.per_page) || 10;
			this.page.pageNumber = parseInt(params.page) || 1;
      this.getHeaderFooter({
        searchParams: this.searchParam, // search input
        offset: (this.page.pageNumber)*this.page.size,
        limit: this.page.size, ...filters })
		}),
	);

    this.setPage({ offset: this.page.pageNumber-1 || 0 })
  }
  ngOnDestroy()
  {
	unSubAllPrevious(this.subscription);
  }
  public openManager() {
    this.layoutService.openTemplate = true;
  }
  public openAndCloseFilters(i) {
    this.isOpenFilters[i] = !this.isOpenFilters[i];
    if (i != undefined) {
      this.getTag(this.searchSections[i].section_id, i);
    }
  }
  updateIndex(index) {
    this.startindex = index * 10
    this.endindex = this.startindex + 10
  }
  setPage(pageInfo) {
    let pageNum;
    // this.selection.clear();
    if (pageInfo.offset == undefined) { pageInfo.offset = 0 }
    pageNum = pageInfo.offset;
    this.page.pageNumber = pageInfo.offset;
    const pageNumber = this.page.pageNumber + 1;
    let filters = checkReactiveFormIsEmpty(this.form);
    this.queryParams = {
      filter: !isObjectEmpty(filters),
      order: OrderEnum.ASC,
      per_page: this.page.size,
      page: pageNumber,
      pagination: true,
    };
    let per_page: any = this.page.size;
    let queryparam = { per_page, page: pageNumber }

    this.addUrlQueryParams({ ...filters, ...queryparam });
    this.getHeaderFooter({
      searchParams: this.searchParam, // search input
      offset: (this.page.pageNumber)*this.page.size,
      limit: this.page.size, ...filters })
    this.startindex = pageNum * per_page
    this.endindex = this.startindex + parseInt(per_page)

  }
  addUrlQueryParams(params?) {
    this.location.replaceState(
      this.router.createUrlTree([], { queryParams: params, }).toString()
    );
  }
  pageLimit(size) {
    this.page.size = size
    this.setPage(this.page)
  }
 

//   public openModel(row?) {
//     this.title = 'Add New'
//     this.buttonTitle = 'Save'
//     const ngbModalOptions: NgbModalOptions = {
//       backdrop: 'static',
//       keyboard: false,
//       windowClass: 'modal_extraDOc',
//     };
//     if (row) {
//       this.title = 'Edit';
//       this.buttonTitle = 'Update';
//     }
//     this.layoutService.headerFooterModal = this.modalService.open(HeaderFooterModalComponent, ngbModalOptions);
//   }

//   public openManager() {
//     this.layoutService.openTemplate = true;
//   }

//   resetFilters() {

//   }
//   /** Search  Template Route */
  public getHeaderFooter(params) {
    if (!params) {
      this.searchParam = '';
    }
    const obj = {
      searchParams: params.searchParams, // search input
      offset: params.offset,
      limit: params.limit
    };
	  this.loadSpin = true;
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.getHeaderFooter,
        'POST',
        REQUEST_SERVERS.templateManagerUrl,
        obj
      ).subscribe(
        (res: any) => {
			    this.loadSpin = false;
          this.searchSections = [];
          this.searchSections = res.data[0].sections;
          this.isOpenFilters = Array(this.searchSections.length).fill(true);
          this.tags = Array(this.searchSections.length);
          this.page.totalElements = res.data[0].length
          // for (let section of this.searchSections) {
          //   for (let component of section.dashboard) {
          //     component.obj.statement = this.sanitizer.bypassSecurityTrustHtml(component.obj.statement);
          //   }
          // }
        },(error) => {
			this.loadSpin = true;
		});
  }

//   public deleteHeaderFooter(id) {
//     const obj = {
//       template_id: id, // search input
//       user_id:this.storageData.getUserId()
//     };
//     this.requestService
//       .sendRequest(
//         TemplateMasterUrlEnum.deleteHeaderFooter,
//         'POST',
//         REQUEST_SERVERS.templateManagerUrl,
//         obj
//       ).subscribe(
//         (res: any) => {
//           let filters = checkReactiveFormIsEmpty(this.form);
//           this.getHeaderFooter({
//             searchParams: this.searchParam, // search input
//             offset: (this.page.pageNumber)*this.page.size,
//             limit: this.page.size, ...filters });
//           this.viewTemplateCheck = false
//           this.toasterService.success('Successfully Deleted', 'Success');

//         });
//   }

//   public deletePermissions(id, index) {
//     let reqObj = {
//       permission_id: id,
// 			'user_id': this.storageData.getUserId()
//     }
//     this.requestService
//       .sendRequest(
//         TemplateMasterUrlEnum.deleteHFPermissions,
//         'POST',
//         REQUEST_SERVERS.templateManagerUrl,
//         reqObj
//       ).subscribe(
//         (res: any) => {
//           this.toasterService.success(res.message, "Success")
//           this.getTag(this.searchSections[index].section_id, index);
//         })
//   }

  public getTag(id, index) {
    let reqObj = {
      template_id: id,
    }
    this.requestService
      .sendRequest(
        TemplateMasterUrlEnum.getHFPermissions,
        'POST',
        REQUEST_SERVERS.templateManagerUrl,
        reqObj
      ).subscribe(
        (res: any) => {
          this.tags[index] = res.data[0];
        })
  }

  public editTemplate(section) {
    const data = section;
    if (typeof (data.options) === 'string') {
      data.options = JSON.parse(data.options);
    }
    this.layoutService.componentsService = [];
    this.layoutService.editTemplate = true;
    for (let i = 0; i < data.dashboard.length; i++) {
      this.layoutService.componentsService.push({ id: data.dashboard[i].id, componentRef: data.dashboard[i].obj.type });
    }
    this.layoutService.section = data;
    this.layoutService.openTemplate = true;
  }

  public viewTemplate(section) {
    const data = section;
    if (typeof (data.options) === 'string') {
      data.options = JSON.parse(data.options);
    }
    this.layoutService.componentsService = [];
    this.layoutService.editTemplate = true;
    for (let i = 0; i < data.dashboard.length; i++) {
      this.layoutService.componentsService.push({ id: data.dashboard[i].id, componentRef: data.dashboard[i].obj.type });
    }
    this.layoutService.section = data;
    this.viewTemplateCheck = true;
  }

  public editHFPermissions(index) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false,
      windowClass: 'modal_extraDOc',
    };
    this.layoutService.section = this.searchSections[index];
    this.layoutService.headerFooterModal = this.modalService.open(HeaderFooterModalComponent, ngbModalOptions);
    this.layoutService.headerFooterModal.result.then(res => {
      this.getTag(this.searchSections[index].section_id, index);
    })
  }

  getComponentRef(id: string) {
    const comp = this.layoutService.componentsService.find(c => c.id === id);
    return comp ? comp.componentRef : null;
  }
  checkInputs() {
	if (this.searchParam) {
		return false;
	  }
	  return true;
}

}
