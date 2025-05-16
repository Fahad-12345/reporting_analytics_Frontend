export enum PaymentTypeUrlsEnum {
	// PaymentType_list_GET = 'payment-type/',
	PaymentType_list_GET = 'bill-response/master/payment-type',
	PaymentType_list_POST = 'bill-response/master/payment-type/add',
	PaymentType_list_PATCH = 'bill-response/master/payment-type/edit',
	PAYMENT_TYPE_SINGLE_GET = "bill-response/master/payment-type/",


	PaymentType_list_DELETE = 'payment-type/destroy',
	PaymentType_list_DELETEMultiple = 'payment-type/destroyAll',

	// search for apyment
	PaymentType_Search_GET = 'payment-type/search',
}


