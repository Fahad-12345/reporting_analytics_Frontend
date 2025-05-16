
export enum VerificationBillEnum {
	
	VerificationPost = "bill-response/verification-received/add",
	VerificationGet = "bill-response/verification-received",
	VerificationRecivedDelete = "bill-response/verification-received/delete",
	Verification_Received_Edit = "bill-response/verification-received/edit",
	DenialEdit = "bill-response/denial/edit",

	VerificationSentGet = 'bill-response/verification-sent',
	Verification_Sent_Post = "bill-response/verification-sent/add",
	Verification_Sent_EDIT = "bill-response/verification-sent/edit",
	VerificationSentDelete = "bill-response/verification-sent/delete",
	Verification_View = "bill-response/verification-view",
	Get_verification_reply = "bill-response/generate/pom",

	POM_verification = "export/generate-pom-verification"
	
}
