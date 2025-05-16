import { Injectable } from '@angular/core';
import { PaidByUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PaidBy-Urls-Enum';
import { PaymentActionTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/payment.action.type.Enum';
import { PaymentStatusUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/payment.status.url';
import { PaymentTypeUrlsEnum } from '@appDir/front-desk/masters/billing/billing-master/PaymentType-Urls-enum';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
import { removeEmptyKeysFromObject } from '@appDir/shared/utils/utils.helpers';
import { BehaviorSubject, of } from 'rxjs';
import { PaymentBillUrlsEnum } from './payment.enum.urls';

@Injectable({
	providedIn: 'root',
})
export class PaymentService {
	paymentReceptionTypes: any[] = [];
	paidbyComingData: any[] = [];
	paymentStatusComingData: any[] = [];
	actionTypeData: any[] = [];
	public reloadPayment = new BehaviorSubject(0);
	public bill_ids: any;
	public selected_bill_params:any;
	public resetForm =  new BehaviorSubject(false);
	public paymentEditPopup =  new BehaviorSubject(false);
	constructor(private requestService: RequestService,  private storageData: StorageData) {}

	paymentType(params) {
		// if (this.hasPaymentTypeList()) {
			return this.requestService.sendRequest(
				PaymentTypeUrlsEnum.PaymentType_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				params,
			);
		// } else {
		// 	return of(this.paymentReceptionTypes);
		// }
	}

	setPaymentType(paymentType: any[]) {
		this.paymentReceptionTypes = paymentType;
	}

	hasPaymentTypeList(): boolean {
		return this.paymentReceptionTypes.length === 0;
	}

	getPaymentBy(queryParams: any) {
			return this.requestService.sendRequest(
				PaidByUrlsEnum.PaidBy_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				removeEmptyKeysFromObject(queryParams),
			);
	}

	setPaymentBy(paidbyComingData: any[]) {
		this.paidbyComingData = paidbyComingData;
	}

	hasPaymentByList(): boolean {
		return this.paidbyComingData.length === 0;
	}

	getPaymentStatus(params) {
		if (this.hasPaymentStatusList()) {
			return this.requestService.sendRequest(
				PaymentStatusUrlsEnum.PaymentStatus_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				params,
			);
		} else {
			return of(this.paymentStatusComingData);
		}
	}

	setPaymentStatus(paymentStatusComingData: any[]) {
		this.paymentStatusComingData = paymentStatusComingData;
	}

	hasPaymentStatusList(): boolean {
		return this.paymentStatusComingData.length === 0;
	}

	getActionType(params) {
		if (this.hasActionType()) {
			return this.requestService.sendRequest(
				PaymentActionTypeUrlsEnum.Payment_Action_Type_list_GET,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				params,
			);
		} else {
			return of(this.actionTypeData);
		}
	}

	setActionType(actionTypeData: any[]) {
		this.actionTypeData = actionTypeData;
	}

	hasActionType(): boolean {
		return this.actionTypeData.length === 0;
	}

	pushReloadPayment(status: any){
		this.bill_ids = status;
		this.reloadPayment.next(status);
	}

	pullReloadPayment(){
		return this.reloadPayment.asObservable();
	}

	viewDocFile(link) {
		if (link) {
			window.open(link);
		}
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}

	isBillId(): boolean{
		return this.bill_ids != 0 ? true: false; 
	}

	setBillId(id: any){
		this.bill_ids = id;
	}

	reloadPaymentAfterAdd(){
		this.reloadPayment.next(this.bill_ids);
	}

	pushResetForm(status: boolean){
		this.resetForm.next(status);
	}

	pullResetForm(){
		return this.resetForm.asObservable();
	}

	pushPaymentEditPopup(status: boolean){
		this.paymentEditPopup.next(status);
	}

	pullPaymentEditPopup(){
		return this.paymentEditPopup.asObservable();
	}

	getPaymentByInfo(params) {
			return this.requestService.sendRequest(
				PaymentBillUrlsEnum.PAYMENT_TYPE_BY_INFO,
				'GET',
				REQUEST_SERVERS.fd_api_url,
				params,
			);
	}

	getPaymentRecipient(params){
		return this.requestService.sendRequest(
			PaymentBillUrlsEnum.getPaymentRecipient,
			'GET',
			REQUEST_SERVERS.fd_api_url,
			params,
		)
	}

	private getBulkData$ = new BehaviorSubject({});
	public bulkObj$ = this.getBulkData$.asObservable();
	getBulkObj(params) {
		this.getBulkData$.next(params);
	}

	private bulkBillsData$ = new BehaviorSubject([]);
	public bulkData$ = this.bulkBillsData$.asObservable();
	getBills(bills) {
		this.bulkBillsData$.next(bills);
	}
}
