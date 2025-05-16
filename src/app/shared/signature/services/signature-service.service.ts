import { Injectable } from '@angular/core';
import { RequestService } from '@appDir/shared/services/request.service';
import { SignatureURLEnum } from '../SignatureURLEnums.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DocTypeEnum } from '../DocTypeEnum.enum';
import { Observable, throwError ,of } from 'rxjs';
import { ToastrService } from 'ngx-toastr';

@Injectable({
	providedIn: 'root'
})
export class SignatureServiceService {

	constructor(private requestService: RequestService, private toastrService: ToastrService) { }


	// 	- object_id: required | int 
	// - doc_type: required [userSignature, facilitySignature]
	getSignature(object_id: number, doc_type: DocTypeEnum) {
		return this.requestService.sendRequest(SignatureURLEnum.getAll, 'get', REQUEST_SERVERS.document_mngr_api_path, { object_id, doc_type })
	}

	// 	- object_id: required | int 
	// - signature_file: required | multipart image
	// - doc_type: required [userSignature, facilitySignature]
	createSignature(object_id: number, signature_file: any, doc_type: DocTypeEnum, file_title: string) {

		if (signature_file) {

			if (!file_title) {
				this.toastrService.error('Signature Title is required', 'Error');
				return throwError(null)
			}
			const formData = new FormData()
			formData.append('object_id', `${object_id}`)
			signature_file ? formData.append('signature_file', signature_file, 'signature.png') : null
			formData.append('file_title', file_title ? file_title : '')
			formData.append('doc_type', `${doc_type}`)
			return this.requestService.sendRequest(SignatureURLEnum.createSignature, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)

		} else {

			// this.toastrService.error('Please mention')
			return of({})
		}

	}

	// 	- id: required | int 
	// - object_id: required | int 
	// - signature_file: required | multipart image
	// - doc_type: required [userSignature, facilitySignature]

	updateSignature(id: number, object_id: number, signature_file: any, doc_type: DocTypeEnum) {
		return this.requestService.sendRequest(SignatureURLEnum.editSignature, 'post', REQUEST_SERVERS.document_mngr_api_path, { id, object_id, signature_file, doc_type })
	}

	deleteSignature(id: number) {
		return this.requestService.sendRequest(SignatureURLEnum.deleteSignature, 'post', REQUEST_SERVERS.document_mngr_api_path, { id })
	}


	// 	"object_id",
	// "signature_file",
	// "doc_type",
	// "file_title",
	// "doctor_signature_file",
	// "patient_signature_file",
	// "doctor_signature_id",
	// "patient_signature_id"
	specialtyCreateSignature(
		object_id: number,
		patient_signature_file?: Blob,
		patient_file_name?: string,
		doctor_signature_file?: Blob,
		doctor_file_name?: string,
		patient_signature_id?: number,
		doctor_signature_id?: number) {


		let formData = new FormData();
		formData.append('object_id', `${object_id}`);
		patient_signature_file ? formData.append('patient_signature_file', patient_signature_file, patient_file_name) : null;
		doctor_signature_file ? formData.append('doctor_signature_file', doctor_signature_file, doctor_file_name) : null;
		formData.append('doc_type', DocTypeEnum.visitSignature);
		patient_signature_id && !patient_signature_file ? formData.append('patient_signature_id', `${patient_signature_id}`) : null;
		doctor_signature_id && !doctor_signature_file ? formData.append('doctor_signature_id', `${doctor_signature_id}`) : null;
		return this.requestService.sendRequest(SignatureURLEnum.createSignature, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)

	}

}
