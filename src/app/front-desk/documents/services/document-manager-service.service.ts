import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import {
	BehaviorSubject,
	map,
	Observable,
} from 'rxjs';

import { Config } from '@appDir/config/config';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';

import { documentManagerUrlsEnum } from '../document-manager-Urls-enum';

@Injectable({
	providedIn: 'root',
})
export class DocumentManagerServiceService {
	constructor(
		private http: HttpClient,
		private config: Config,
		private requestService: RequestService,
		private storageData: StorageData,
	) {}

	resetNewFolderComponent = new BehaviorSubject(null);
	tags = [];
	onFoldersUpdate: BehaviorSubject<any> = new BehaviorSubject(false);
	isRefresh: BehaviorSubject<boolean> = new BehaviorSubject(false);
	onFileUpload :  BehaviorSubject<string> = new BehaviorSubject('uploadFile');
	successfullyMerged: BehaviorSubject<any> = new BehaviorSubject(false);

	UpdateFolder() {
		this.onFoldersUpdate.next(true);
	}
	Refresh() {
		// this.isRefresh.next(true)
	}
	baseUrl = this.config.getConfig(REQUEST_SERVERS.document_mngr_api_path); //"http://34.203.126.161/document-manager/"
	private getAllFoldersUrl = 'v1/get-all-folders-by-objectId';
	// private getFilesFromFolderIdUrl = "get-all-files-by-folder-id"
	private getAllFilesByFolderIdUrl = 'v1/get-all-files-by-folder-id';

	private getFilesFromFolderIdUrlwithTags = 'get-all-files-and-child-by-folder-id-and-tags';
	private getAllFoldersUrlv1 = 'v1/get-all-folders-by-objectId-v1';

	private getAllChildFolderFilesIdAndFilesByFolderIdUrl =
		'get-all-child-folder-files-id-and-files-id-by-folder-id';
	private printFilesUrl = 'merge-pdf';
	private newprintFilesUrl = 'v1/print-files';
	private getAllChildFoldersByFolderIdUrl = 'v1/get-child-folders-by-folderId';
	private emailUrl = 'email';

	resetNewFolder() {
		this.resetNewFolderComponent.next(true);
	}

	getAllFolders(objectId, objectType) {
		return this.requestService.sendRequest(
			this.getAllFoldersUrl,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			{ objectId, objectType },
		);
		// return this.http.post(this.baseUrl + this.getAllFoldersUrl, { objectId, objectType })
	}
	
	getAllFoldersV1(objectId, objectTypes) {
		return this.requestService.sendRequest(
			this.getAllFoldersUrlv1,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			{ objectId, objectTypes },
		);
		// return this.http.post(this.baseUrl + this.getAllFoldersUrl, { objectId, objectType })
	}
	getFilesFromFolderId(id, pageSize?, pageNumber?, tags?: any, visit_id?: number) {
	
		let tagStr : any = [];
		tagStr = tags && tags.size ? Array.from(tags).join() : '';
		let selTags : any = [];
		tagStr.split(',').forEach(val => selTags.push(val))
		if (pageNumber == 0) {
			pageNumber = 1;
		}
		var requestObj = {};
		requestObj['id'] = id;
		requestObj['reference_id']= visit_id;
		if (pageSize) {
			requestObj['pageSize'] = pageSize;
		}
		if (pageNumber) {
			requestObj['pageNumber'] = pageNumber;
		}
		if (tagStr) {
			requestObj['tags'] = selTags;
			// return this.requestService.sendRequest(this.getFilesFromFolderIdUrlwithTags, 'post', REQUEST_SERVERS.document_mngr_api_path, requestObj).map(response => {
			//   ;
			//   response['data'] = response['data']['files']
			//   return response
			// })
			// return this.http.post(this.baseUrl + this.getFilesFromFolderIdUrlwithTags, requestObj)
		}
		return this.requestService.sendRequest(
			this.getAllFilesByFolderIdUrl,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			requestObj,
		);
	}
	getAllChildFoldersByFolderId(folderId) {
		if (folderId){
		return this.requestService.sendRequest(
			this.getAllChildFoldersByFolderIdUrl,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			{ folderId },
	    	);
		}
		// return this.http.post(this.baseUrl + this.getAllChildFoldersByFolderIdUrl)
	}
	getAllChildFolderFilesIdAndFilesByFolderId(folderIds: Array<string>) {
		//
		return this.requestService.sendRequest(
			this.getAllChildFolderFilesIdAndFilesByFolderIdUrl,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			{ folderIds },
		);
		return this.http.post(this.baseUrl + this.getAllChildFolderFilesIdAndFilesByFolderIdUrl, {
			folderIds,
		});
	}
	printFiles(requestData) {
		return this.requestService.sendRequest(
			this.printFilesUrl,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			requestData,
		);
		// return this.http.post(this.baseUrl + this.printFilesUrl, requestData)
	}
	_printFiles(requestData, printJs) {
		let url: string = this.requestService.makeUrl(
			this.newprintFilesUrl,
			REQUEST_SERVERS.document_mngr_api_path,
		);
		let _url = new URL(url);
		// requestData.fileIds.forEach(id => {
		// 	_url.searchParams.append('fileIds', id)
		// })
		let filesIds:any[]=[] =Array.from(new Set(requestData.fileIds));
		filesIds.forEach(element => {
			_url.searchParams.append('fileIds[]',element);
		});
		printJs(this.getLinkwithAuthToken(_url));
	}
	getLinkwithAuthToken(link) {
		let token = this.storageData.getToken();
		if (token) {
			return `${link}&token=${token}`;
		} else {
			return link;
		}
	}
	uploadDocumentUrl = 'v1/upload-files-by-folder';
	uploadDocument(data) {
		return this.requestService
			.sendRequest(this.uploadDocumentUrl, 'post_file', REQUEST_SERVERS.document_mngr_api_path, data)
			.pipe(
			map((response) => {
				// this.UpdateFolder();
				 this.Refresh();
				//  this.onFileUpload.next('uploadFile');
		
				return response;
			}));
	}

	// getFileByIdUrl = 'file-by-id';
	getFileById(id: number, openwindow: boolean = true) {
		let path = this.requestService.makeUrl('', REQUEST_SERVERS.document_mngr_api_path);
		let url = `${path}file-by-id?id=${id}&token=${this.storageData.getToken()}`;

		if (openwindow) window.open(url);
		return url;
		// return this.requestService.sendRequest(this.getFileByIdUrl, 'get', REQUEST_SERVERS.document_mngr_api_path, { id })
	}

	createFolderUrl = 'v1/create-patient-case-directory-by-document-manager';
	createFolder(data) {
		return this.requestService
			.sendRequest(this.createFolderUrl, 'post', REQUEST_SERVERS.document_mngr_api_path, data)
			.pipe(
			map((response) => {
				this.UpdateFolder();
				return response;
			}));
	}
	private search_file = 'search-file';
	searchFiles(formData) {
		// console.log('formData', formData);
		return this.requestService.sendRequest(
			this.search_file,
			'post',
			REQUEST_SERVERS.document_mngr_api_path,
			formData,
		);
	}
	//----------------
	private mergeDocURL = 'merge-files';
	private mergeDocWithJobsURL = 'merge-pdf-job';
	private deleteDocURL = 'delete-file-by-ids';
	private copyDocURL = 'copy-file';
	private movefilesDocURL = 'move-file';
	public folderIds = [];
	emailDocument(formData) {
		return this.requestService
			.sendRequest(this.emailUrl, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
			.pipe(
			map((response) => {
				this.Refresh();
				return response;
			}));
	}
	mergeDocuments(formData) {
		return this.requestService
			.sendRequest(this.mergeDocURL, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
			.pipe(
			map((response) => {
				this.UpdateFolder();
				this.Refresh();
				return response;
			}));
	}
	mergeDocumentsWithJobs(formData) {
		return this.requestService
			.sendRequest(this.mergeDocWithJobsURL, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
			.pipe(
			map((response) => {
				this.UpdateFolder();
				this.Refresh();
				return response;
			}));
	}
	deleteDocument(formData) {
		return this.requestService
			.sendRequest(this.deleteDocURL, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
			.pipe(
			map((response) => {
				// formData.folderIds && formData.folderIds.length > 0 ? this.UpdateFolder() : ""
				// this.Refresh()
				this.UpdateFolder();
				formData.folderIds && formData.folderIds.length > 0 ? '' : this.Refresh();
				return response;
			}));
	}
	copyDocument(formData) {
		return this.requestService
			.sendRequest(this.copyDocURL, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
			.pipe(
			map((response) => {
				this.UpdateFolder();
				this.Refresh();
				return response;
			}));
	}
	moveDocument(formData) {
		return this.requestService
			.sendRequest(this.movefilesDocURL, 'post', REQUEST_SERVERS.document_mngr_api_path, formData)
			.pipe(
			map((response) => {
				this.UpdateFolder();
				this.Refresh();
				return response;
			}));
	}

	editDocument(formData): Observable<any> {
		return this.requestService
			.sendRequest(
				documentManagerUrlsEnum.editFileDocManger,
				'post',
				REQUEST_SERVERS.document_mngr_api_path,
				formData,
			)
			.pipe(
			map((response) => {
				return response;
			}));
	}

	clearSignature(body) {
		return this.requestService
			.sendRequest(
				documentManagerUrlsEnum.clearSignature,
				'post',
				REQUEST_SERVERS.document_mngr_api_path,
				body,
			)
			.pipe(
			map((response) => {
				return response;
			}));
	}
}
