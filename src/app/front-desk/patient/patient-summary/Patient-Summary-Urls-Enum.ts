export enum PatientSummaryUrlsEnum {
	PatientSummary_pdf_GET = 'GeneratePdfs/createPdf',

	// below first part and second part both concatinated to make one url
	patient_list_pdf_Url_firstPart_GET = 'GeneratePdfs/createPdf?data={"caseId": ',
	patient_list_pdf_Url_secondPart_GET = ',"name": "patientSummary", "provider": "","multiple": false}',
}
