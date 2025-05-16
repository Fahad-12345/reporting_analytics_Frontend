import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { DocumentManagerServiceService } from '../../services/document-manager-service.service';
import { FolderModel } from '../../Models/FolderModel.Model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { NewFolderModalComponent } from '../modals/new-folder-modal/new-folder-modal.component';
import { Subscription } from 'rxjs';
import { FDServices } from '@appDir/front-desk/fd_shared/services/fd-services.service';

@Component({
  selector: 'app-upload-document-modal',
  templateUrl: './upload-document-modal.component.html',
  styleUrls: ['./upload-document-modal.component.scss']
})
export class UploadDocumentModalComponent implements OnInit {

  constructor(private documentManagerService: DocumentManagerServiceService, private fb: FormBuilder
    , private activeModal: NgbActiveModal, private ngbModal: NgbModal, private fdService: FDServices) { }

  @Input() folderId: any
  @Input() caseId: any
  @Output() onSubmitFunction = new EventEmitter<any>()
  @Input() disableBtn
  @Input() ext
  @Input() disableNewFolderBtn: any
  @Output() onSubmitCreateFolder = new EventEmitter<any>()
  form: FormGroup
  @Input() reset = new EventEmitter();
  @Input() folderList: Array<FolderModel>
  @Input() uploadCount: number;
  disableFolderList: boolean = false;
  observable: Subscription
  ngOnInit() {


    this.initForm();
    var that = this;
    this.observable = this.documentManagerService.resetNewFolderComponent.subscribe(data => {
      if (data == true) {
        if (that.newFolderModalRef) {
          that.newFolderModalRef.componentInstance.disableNewFolderBtn = false;
          that.newFolderModalRef.close()
          this.getSubFoldersByFolderId(this.folderId)
        }

        this.getAllFolders()
        if (this.folderId) {

          this.getSubFoldersByFolderId(this.folderId)
          this.disableFolderList = true;
          this.form.patchValue({ parentId: this.folderId })
        }
      }
    })
    if (!this.disableBtn) {
      this.disableBtn = false;
    }
    // this.getAllFolders()

    if (this.folderId) {
      this.getSubFoldersByFolderId(this.folderId)
      this.disableFolderList = true;
      this.form.patchValue({ parentId: this.folderId })
      this.form.get('parentId').disabled
    }
  }


  getAllFolders() {
    this.documentManagerService.getAllFolders(this.caseId, 'patientCases').subscribe(data => {
      this.folderList = data['data']
    })
  }
  subfolderList = []
  getSubFoldersByFolderId(folderId) {
    if (!folderId) {
      return;
    }
    this.folderId = folderId
    this.documentManagerService.getFilesFromFolderId(folderId, null, null, new Set()).subscribe(data => {
      this.subfolderList = [...data['data']['child']]
    })
  }
  initForm() {
    ;
    this.form = this.fb.group({
      // fileTitle: ['', [Validators.required]],
      fileTitle: [''],
      tags: [[]],
      description: [''],
      parentId: ['', [Validators.required]],
      sfolderId: [''],
      ext: [this.ext]
    });

    (this.uploadCount > 1) ? this.form.controls['fileTitle'].clearValidators() :
      this.form.controls['fileTitle'].setValidators([Validators.required]);
  }

  submitForm(form) {
    if (this.form.valid) {
      this.onSubmitFunction.emit(form)
    } else {
      this.form.markAsTouched()
    }

  }

  getSubFolderList(id) {
    if (id)
      var obj = this.folderList.find((folder: any) => {
        if (folder.id == id) {
          return folder.child
        }
      })
    return obj;
  }
  close() {
    this.activeModal.close()
  }
  ngOnChanges(changes: SimpleChanges) {
    this.form.patchValue({ parentId: this.folderId })
    this.getSubFoldersByFolderId(this.folderId)
  }

  newFolderModalRef: NgbModalRef
  createFolder() {
    // console.log(this.form.getRawValue());
    this.fdService.createFolder({
      caseId: this.caseId,
      folderList: this.caseId,
      disableNewFolderBtn: this.disableNewFolderBtn,
      onSubmitCreateFolder: this.onSubmitCreateFolder,
      component: NewFolderModalComponent,
      folderId: this.folderId,
      parentId: this.form.get('parentId').value,
    });
    /*	;
    this.newFolderModalRef = this.ngbModal.open(NewFolderModalComponent);
    this.newFolderModalRef.componentInstance.caseId = this.caseId;
    this.newFolderModalRef.componentInstance.folderList = this.folderList;
    this.newFolderModalRef.componentInstance.disableNewFolderBtn = this.disableNewFolderBtn;
    this.newFolderModalRef.componentInstance.onSubmitCreateFolder = this.onSubmitCreateFolder;
    this.fdService.modalRef = this.newFolderModalRef;
    
    this.newFolderModalRef.result.then( () => {
    ;
    this.getAllFolders();
    if (this.folderId) {
    this.getSubFoldersByFolderId(this.folderId);
    this.disableFolderList = true;
    this.form.patchValue({parentId: this.folderId});
    }
    }, () => {
    ;
    this.newFolderModalRef.componentInstance.disableNewFolderBtn = false;
    });*/

  }
  closeNewFolderModal() {
    this.newFolderModalRef.close()
  }
  ngOnDerstroy() {
    this.observable.unsubscribe()
  }
}
