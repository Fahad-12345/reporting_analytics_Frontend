"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
exports.__esModule = true;
exports.SpecialityListing = void 0;
var core_1 = require("@angular/core");
var forms_1 = require("@angular/forms");
var collections_1 = require("@angular/cdk/collections");
var page_1 = require("@appDir/front-desk/models/page");
var Speciality_urls_enum_1 = require("./Speciality-urls-enum");
var CustomUrlBuilder_class_1 = require("@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class");
var request_servers_enum_1 = require("@appDir/request-servers.enum");
var helpers_1 = require("@appDir/shared/utils/helpers");
var permission_abstract_component_1 = require("@appDir/front-desk/permission.abstract.component");
var visit_type_enum_1 = require("../../vistType/visit.type.enum");
var SpecialityListing = /** @class */ (function (_super) {
    __extends(SpecialityListing, _super);
    function SpecialityListing(confirmService, modalService, fb, route, logger, toastrService, http, acl, requestService, CanDeactivateModelComponentService, rou, location) {
        var _this = _super.call(this, acl, rou) || this;
        _this.confirmService = confirmService;
        _this.modalService = modalService;
        _this.fb = fb;
        _this.route = route;
        _this.logger = logger;
        _this.toastrService = toastrService;
        _this.http = http;
        _this.requestService = requestService;
        _this.CanDeactivateModelComponentService = CanDeactivateModelComponentService;
        _this.location = location;
        _this.submitted = false;
        _this.selection = new collections_1.SelectionModel(true, []);
        _this.isLoading = false;
        _this.hasId = false;
        _this.specialities = [];
        _this.bools = true;
        _this.lstVisitTypes = [];
        _this.subscription = [];
        _this.showTable = false;
        _this.maxVal = 200;
        _this.loadSpin = false;
        _this.page = new page_1.Page();
        _this.page.pageNumber = 0;
        _this.page.size = 10;
        return _this;
    }
    SpecialityListing.prototype.onValueChange = function (event, field) {
        var value = {};
        var val = '';
        if (parseInt(event) < 0 || isNaN(parseInt(event))) {
            value[field] = val;
            this.specialityForm.patchValue(value);
        }
        if (parseInt(event) > this.maxVal) {
            val = this.maxVal;
            value[field] = val;
            this.specialityForm.patchValue(value);
        }
    };
    SpecialityListing.prototype.ngOnInit = function () {
        var _this = this;
        this.specialityForm = this.fb.group({
            id: null,
            name: ['', [forms_1.Validators.required]],
            time_slot: ['', [forms_1.Validators.required, forms_1.Validators.min(0), forms_1.Validators.max(this.maxVal)]],
            over_booking: ['', [forms_1.Validators.required, forms_1.Validators.min(0), forms_1.Validators.max(this.maxVal)]],
            description: [''],
            available_specialties_id: [''],
            visit_type_ids: [''],
            is_create_appointment: ['']
        });
        this.searchForm = this.fb.group({
            name: [''],
            time_slot: [''],
            over_booking: ['']
        });
        console.log(this.searchForm);
        this.subscription.push(this.route.queryParams.subscribe(function (params) {
            _this.searchForm.patchValue(params);
            _this.page.size = parseInt(params.per_page) || 10;
            _this.page.pageNumber = parseInt(params.page) || 1;
            _this.page.size = parseInt(params.per_page) || 10;
        }));
        this.setPage({ offset: this.page.pageNumber - 1 || 0 });
        setTimeout(function () {
            _this.showTable = true;
        }, 400);
    };
    SpecialityListing.prototype.setPage = function (pageInfo) {
        var pageNum;
        this.selection.clear();
        pageNum = pageInfo.offset;
        this.page.pageNumber = pageInfo.offset;
        var pageNumber = this.page.pageNumber + 1;
        var filters = helpers_1.checkReactiveFormIsEmpty(this.searchForm);
        this.queryParams = {
            filter: !helpers_1.isObjectEmpty(filters),
            order: CustomUrlBuilder_class_1.OrderEnum.ASC,
            per_page: this.page.size,
            page: pageNumber,
            pagination: true
        };
        var per_page = this.page.size;
        var queryparam = { per_page: per_page, page: pageNumber };
        this.addUrlQueryParams(__assign(__assign({}, filters), queryparam));
        this.getSpecialities(__assign(__assign({}, this.queryParams), filters));
        this.getVisitTypes();
    };
    SpecialityListing.prototype.addUrlQueryParams = function (params) {
        this.location.replaceState(this.router.createUrlTree([], { queryParams: params }).toString());
    };
    Object.defineProperty(SpecialityListing.prototype, "addForm", {
        get: function () {
            return this.specialityForm.controls;
        },
        enumerable: false,
        configurable: true
    });
    SpecialityListing.prototype.getSpecialities = function (queryParams) {
        var _this = this;
        this.loadSpin = true;
        this.subscription.push(this.requestService
            .sendRequest(Speciality_urls_enum_1.SpecialityUrlsEnum.Speciality_list_Get, 'GET', request_servers_enum_1.REQUEST_SERVERS.fd_api_url, queryParams)
            .subscribe(function (data) {
            if (data.status) {
                _this.loadSpin = false;
                // if (data.result.total < this.page.totalElements && !data.result.length) {
                // 	this.getSpecialities({ ...queryParams, ...{ page: 1 } })
                // } else {
                _this.specialities = data.result && data.result.data ? data.result.data : [];
                _this.page.totalElements = data.result && data.result.total ? data.result.total : 0;
                // }
            }
        }, function (err) {
            _this.loadSpin = false;
        }));
    };
    SpecialityListing.prototype.getVisitTypes = function () {
        var _this = this;
        this.subscription.push(this.requestService
            .sendRequest(visit_type_enum_1.VisitTypeUrlsEnum.VisitType_list_GET, 'GET', request_servers_enum_1.REQUEST_SERVERS.fd_api_url)
            .subscribe(function (data) {
            ;
            if (data.status === 200 || data.status) {
                _this.lstVisitTypes = data && data.result ? data.result.data : [];
                // this.page.totalElements = data && data.result.total ? data.result.total : 0;
                // this.loadSpin = false;
            }
        }, function (err) {
        }));
    };
    SpecialityListing.prototype.getAvailableSpecialities = function (row) {
        var _this = this;
        this.subscription.push(
        // this.fd_services.get_all_available_specialties()
        this.requestService
            .sendRequest(Speciality_urls_enum_1.SpecialityUrlsEnum.available_list_speciality_get, 'GET', request_servers_enum_1.REQUEST_SERVERS.fd_api_url)
            .subscribe(function (res) {
            _this.server_apps = res.result.data;
            if (!_this.server_apps) {
                return;
            }
            if (row && row.id) {
                _this.server_apps.unshift({ id: row.id, name: row.default_name });
            }
            console.log('this.server_apps---', _this.server_apps);
        }, function (err) {
        }));
    };
    SpecialityListing.prototype.changespecialities = function (event) { };
    SpecialityListing.prototype.openSpecialityForm = function (content, row) {
        this.specialityForm.reset();
        console.log(this.server_apps);
        this.getAvailableSpecialities(row);
        if (row == null) {
            this.hasId = false;
        }
        else {
            this.hasId = true;
            row.available_specialties_id = row.id; //This is going to be the available speciality id. Currently using id because there is no available speciality id sent by the back end. 
            row.visit_type_ids = [];
            row.visit_type_ids = row.visit_types.map(function (visitType) { return visitType.id; });
            this.specialityForm.patchValue(row);
        }
        console.log(this.server_apps);
        var ngbModalOptions = {
            backdrop: 'static',
            keyboard: false,
            windowClass: 'modal_extraDOc'
        };
        this.modalRef = this.modalService.open(content, ngbModalOptions);
    };
    SpecialityListing.prototype.closeModal = function () {
        this.modalRef.close();
        this.specialityForm.reset();
        this.hasId = false;
    };
    SpecialityListing.prototype.assignValues = function () {
        this.specialityForm.patchValue({
            id: this.speciality.id,
            name: this.speciality.name
        });
    };
    SpecialityListing.prototype.onSubmit = function (form) {
        this.isLoading = true;
        if (this.specialityForm.invalid) {
            return;
        }
        this.searchForm.reset();
        if (this.specialityForm.valid) {
            if (form.id == null) {
                this.add(form);
            }
            else {
                this.update(form);
            }
        }
        else {
        }
    };
    SpecialityListing.prototype.onDelete = function (id) {
        var _this = this;
        var temp = [id];
        this.subscription.push(this.confirmService.create('Delete options', "Are you sure you want to delete?").subscribe(function (value) {
            if (value.resolved) {
                _this.subscription.push(
                // this.http.post(SpecialityUrlsEnum.Speciality_list_Delete, { id: temp })
                _this.requestService
                    .sendRequest(Speciality_urls_enum_1.SpecialityUrlsEnum.Speciality_list_Delete, 'DELETE', request_servers_enum_1.REQUEST_SERVERS.fd_api_url, { id: temp })
                    .subscribe(function (res) {
                    _this.setPage({ offset: _this.page.pageNumber });
                    _this.getAvailableSpecialities();
                    _this.specialities = _this.specialities;
                    _this.toastrService.success('Successfully Deleted', 'Success');
                }, function (err) { }));
            }
        }, function (err) {
        }));
    };
    SpecialityListing.prototype.add = function (form) {
        var _this = this;
        console.log('in add form');
        this.subscription.push(
        // this.fd_services.addSpecialities(removeEmptyAndNullsFormObject(form))
        this.requestService
            .sendRequest(Speciality_urls_enum_1.SpecialityUrlsEnum.Speciality_list_POST, 'POST', request_servers_enum_1.REQUEST_SERVERS.fd_api_url, helpers_1.removeEmptyAndNullsFormObject(form))
            .subscribe(function (res) {
            console.log('api create speciality', res);
            _this.modalRef.close();
            _this.specialityForm.reset();
            // this.getSpecialities();
            _this.setPage({ offset: _this.page.pageNumber });
            _this.getAvailableSpecialities(); // this is for dropdown
            _this.toastrService.success("Successfully Added", 'Success');
            _this.isLoading = false;
        }, function (err) {
            _this.isLoading = false;
        }));
    };
    SpecialityListing.prototype.update = function (form) {
        var _this = this;
        console.log('in update form');
        this.subscription.push(
        // this.fd_services.updateSpeciality(form)
        this.requestService
            .sendRequest(Speciality_urls_enum_1.SpecialityUrlsEnum.Speciality_list_PUT, 'PUT', request_servers_enum_1.REQUEST_SERVERS.fd_api_url, form)
            .subscribe(function (res) {
            var msg;
            if (res.message == "Speciality updated successfully, Error Occured while changing timeSlot") {
                msg = "Remove previous created appointment to change specialty time slot";
                _this.modalRef.close();
                _this.specialityForm.reset();
                _this.setPage({ offset: _this.page.pageNumber });
                _this.toastrService.error(msg, 'Error');
                _this.isLoading = false;
            }
            else {
                msg = "Updated successfully!";
                _this.modalRef.close();
                _this.specialityForm.reset();
                _this.setPage({ offset: _this.page.pageNumber });
                _this.toastrService.success(msg, 'Success');
                _this.isLoading = false;
            }
        }, function (err) {
            _this.isLoading = false;
        }));
    };
    SpecialityListing.prototype.stringfy = function (obj) {
        return JSON.stringify(obj);
    };
    SpecialityListing.prototype.masterToggle = function (event) {
        var _this = this;
        this.isAllSelected()
            ? this.selection.clear()
            : this.specialities.slice(0, this.totalRows).forEach(function (row) { return _this.selection.select(row); });
    };
    SpecialityListing.prototype.isAllSelected = function () {
        this.totalRows = this.specialities.length;
        var numSelected = this.selection.selected.length;
        var numRows = this.totalRows;
        return numSelected === numRows;
    };
    SpecialityListing.prototype.bulkDelete = function () {
        var _this = this;
        var selected = this.selection.selected;
        var ids = selected.map(function (row) { return row.id; });
        console.log('ids', ids);
        this.subscription.push(this.confirmService
            .create('Delete Confirmation?', "Are you sure you want to delete?")
            .subscribe(function (value) {
            if (value.resolved) {
                _this.subscription.push(
                // this.http.post('speciality/delete', { id: ids })
                // this.http
                // .post(SpecialityUrlsEnum.Speciality_list_Delete, { id: ids })
                _this.requestService
                    .sendRequest(Speciality_urls_enum_1.SpecialityUrlsEnum.Speciality_list_Delete, 'DELETE', request_servers_enum_1.REQUEST_SERVERS.fd_api_url, { id: ids })
                    .subscribe(function (res) {
                    _this.selection.clear();
                    _this.getAvailableSpecialities();
                    _this.specialities = _this.removeMultipleFromArr(_this.specialities, ids, 'id');
                    _this.specialities = _this.specialities;
                    _this.toastrService.success('Successfully Deleted.', 'Success');
                    console.log(res);
                }));
            }
        }, function (err) {
        }));
    };
    SpecialityListing.prototype.removeMultipleFromArr = function (data, toBeDeleted, key) {
        return data.filter(function (row) { return row["" + key] !== toBeDeleted.find(function (element) { return row["" + key] === element; }); });
    };
    SpecialityListing.prototype.facilityPlus = function () {
        this.bools = !this.bools;
    };
    SpecialityListing.prototype.facilityMinus = function () {
        this.bools = !this.bools;
    };
    SpecialityListing.prototype.onResetFilters = function () {
        this.searchForm.reset();
        this.setPage({ offset: 0 });
    };
    SpecialityListing.prototype.pageLimit = function ($num) {
        this.page.size = Number($num);
        this.setPage({ offset: 0 });
    };
    SpecialityListing.prototype.crossClose = function () {
        var _this = this;
        if ((this.specialityForm.dirty && this.specialityForm.touched)) {
            this.CanDeactivateModelComponentService.canDeactivate().then(function (res) {
                var result = res;
                if (res) {
                    _this.specialityForm.reset();
                    _this.modalRef.close();
                }
                else {
                    return true;
                }
            });
        }
        else {
            this.specialityForm.reset();
            this.modalRef.close();
        }
    };
    SpecialityListing.prototype.unSubAllPrevious = function () {
        if (this.subscription.length) {
            this.subscription.forEach(function (sub) {
                sub.unsubscribe();
            });
        }
    };
    SpecialityListing.prototype.ngOnDestroy = function () {
        this.unSubAllPrevious();
    };
    __decorate([
        core_1.ViewChild('content')
    ], SpecialityListing.prototype, "contentModal");
    __decorate([
        core_1.Input()
    ], SpecialityListing.prototype, "inputValue");
    SpecialityListing = __decorate([
        core_1.Component({
            selector: 'app-specialities-listing',
            templateUrl: './specialities-listing.component.html',
            styleUrls: ['./specialities-listing.component.scss']
        })
    ], SpecialityListing);
    return SpecialityListing;
}(permission_abstract_component_1.PermissionComponent));
exports.SpecialityListing = SpecialityListing;
