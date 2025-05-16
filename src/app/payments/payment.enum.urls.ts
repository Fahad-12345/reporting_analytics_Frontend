export enum PaymentBillUrlsEnum {

	AddPaymentUrl = "bill-response/payment/add",
	getSinglePayment = "bill-response/payment/",
	getAllPayments = 'bill-response/payment',
	PaymentDelete = "bill-response/payment/delete",
	editPayment = "bill-response/payment/edit",
	INTEREST = 'interest',
	BILL='bill',
	INVOICE ='invoice',
	OVER_PAYMENT='overpayment',
	PAYMENT_TYPE_BY_INFO = 'bill-response/payment-by-info',
	getPaymentsOfBill = 'bill-response/invoice-for-bills-payments',
	bulkPaymentUrl='bill-response/bulk-payment/verify',
	addBulkPaymentURL='bill-response/bulk-payment/add',
	getBulkchildBills='bill-response/bulk-payment/dropdown-bill-payments',
	getBulkBills='bill/get-data-for-bulk-payment',
	getPaymentRecipient='bill/get-bill-recipients',
}
