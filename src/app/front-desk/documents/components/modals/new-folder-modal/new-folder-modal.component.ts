import { Component, OnInit, Input, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { DocumentManagerServiceService } from '../../../services/document-manager-service.service';
import { FolderModel } from '../../../Models/FolderModel.Model';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ToastrService } from 'ngx-toastr';


@Component({
  selector: 'app-new-folder-modal',
  templateUrl: './new-folder-modal.component.html',
  styleUrls: ['./new-folder-modal.component.scss']
})
export class NewFolderModalComponent implements OnInit {

  constructor(private fb: FormBuilder, private documentManagerService: DocumentManagerServiceService, private activeModal: NgbActiveModal, private toasterService: ToastrService) { }
  @Input() folder: FolderModel;
  @Input() caseId: number;
  @Input() patientId: number;
  form: FormGroup;
  disableBtn: boolean = false;
  lstSubFolders: FolderModel[][] = []
 @Input() lstFolder: FolderModel[] = [];
 @Output() refreshModelFolders: EventEmitter<any> = new EventEmitter();
  ngOnInit() {
    console.log('helllo')
    this.initForm()

    this.bindFolderChange()

    // this.handleFiles()





    if (this.folder) {
      this.lstFolder.push(this.folder)
      this.form.patchValue({ parentId: this.folder.id })
      this.form.controls['parentId'].disable()
      // this.documentManagerService.getFilesFromFolderId(this.folderId).subscribe(data => {
      //   console.log(data)
      //   this.lstFolder.push(data['data'])
      //   this.form.patchValue({ parentId: data['data'].id })
      //   this.form.controls['parentId'].disable()
      // })
    } else {
      // this.documentManagerService.getAllFolders(this.caseId, 'patientCases').subscribe(data => {
      //   this.lstFolder = data['data']
      // })
    }
  }

  bindFolderChange() {
    this.form.controls['parentId'].valueChanges.subscribe(value => {

      let sFoldersForm: FormArray = <FormArray>this.form.get('sfolderId')
      this.removeFromIndex(0, sFoldersForm)
      let folder = this.lstFolder.find(folder => folder.id == value)
      if (folder && folder.child && folder.child.length > 0) {
        this.lstSubFolders[0] = (folder.child)
        let sFoldersForm: FormArray = <FormArray>this.form.get('sfolderId')
        this.clearFormArray(sFoldersForm)
        let form = this.fb.group({ id: '' })

        sFoldersForm.push(form)
        this.bindSubFolderChange(form, sFoldersForm.length - 1)
      } else if (folder && !folder.child) {
        // this.documentManagerService.getAllChildFoldersByFolderId(value).subscribe(data => {
          folder['child'] = folder.children_recursive.filter(values=>values.parent ==value);
          if (folder.child && folder.child.length > 0) {
            let sFoldersForm: FormArray = <FormArray>this.form.get('sfolderId')
            let form = this.fb.group({ id: '' })
            this.lstSubFolders[0] = (folder.child)
            this.clearFormArray(sFoldersForm)
            sFoldersForm.push(form)
            this.bindSubFolderChange(form, sFoldersForm.length - 1)
          }
        // })
      }
    })
  }


  initForm() {
    this.form = this.fb.group({
      folder: ['', [Validators.required]],
      parentId: ['', [Validators.required]],
      sfolderId: this.fb.array([]),
    })
  }

  close() { this.activeModal.close() }
  clearFormArray = (formArray: FormArray) => {
    while (formArray.length !== 0) {
      formArray.removeAt(0)
    }
  }

  removeFromIndex(index, form: FormArray) {
    while (form.at(index + 1)) {
      form.removeAt(index + 1)
      this.lstSubFolders.splice(index + 1, 1)
    }
  }

  bindSubFolderChange(_form: FormGroup, index) {
    _form.controls['id'].valueChanges.subscribe(value => {

      // if (!value) {
      let sFoldersForm: FormArray = <FormArray>this.form.get('sfolderId')

      this.removeFromIndex(index, sFoldersForm)
      // sFoldersForm.removeAt(index)
      // this.lstSubFolders.splice(index, 1)
      // sFoldersForm.at(index - 1).enable({ emitEvent: false })
      //   return;
      // }

      let folder = this.lstSubFolders[index].find(folder => folder.id == value)


      // if (folder && folder.child && folder.child.length > 0) {
      //   // _form.disable({ emitEvent: false })
      //   this.lstSubFolders[index + 1] = (folder.child)
      //   console.log('subfolders', this.lstSubFolders)
      //   let sFoldersForm: FormArray = <FormArray>this.form.get('sfolderId')
      //   // this.clearFormArray(sFoldersForm)
      //   let form = this.fb.group({ id: '' })
      //   sFoldersForm.push(form)
      //   this.bindSubFolderChange(form, sFoldersForm.length - 1)
      // } else if (folder && !folder.child) {
      // _form.disable({ emitEvent: false })
      // this.documentManagerService.getAllChildFoldersByFolderId(value).subscribe(data => {
        folder['child'] = folder.children_recursive.filter(values=>values.parent ==value);
        if (folder.child && folder.child.length > 0) {
          let sFoldersForm: FormArray = <FormArray>this.form.get('sfolderId')
          let form = this.fb.group({ id: '' })
          this.lstSubFolders[index + 1] = (folder.child)
          // this.clearFormArray(sFoldersForm)
          sFoldersForm.push(form)
          this.bindSubFolderChange(form, sFoldersForm.length - 1)
        }
      // })
      // }
    })
  }

  submitForm(form) {
    this.disableBtn = true;
    form = this.form.getRawValue()
    // let filesData = this.uploadFiles.map(element => {
    //   return {
    //     'fileTitle': form.fileTitle,
    //     'ext': element.ext,
    //     'tags': form.tags.map(tag => tag.value).join(','),
    //     'file': element.file
    //   }
    // })
    // console.log(filesData)
    let folderId = form.parentId;
    form.sfolderId.forEach(subfolder => {
      if (subfolder.id) {
        folderId = subfolder.id
      }
    })
    let requestData = {
      "module": "patientCases",
      "caseId": this.caseId,
      "patientId": this.patientId,
      "folder": form.folder,
      "parent": folderId
    };


    this.documentManagerService.createFolder(requestData).subscribe(data => {
      this.disableBtn = false;
      let createdFolder: FolderModel = data['data'];
      this.toasterService.success('Successfully Added', 'Success')
      if (createdFolder.parent == form.parentId) {
        this.activeModal.close(data['status'] ? data['data'] : null)
      } else {
        this.activeModal.close()
      }
      this.refreshModelFolders.emit(true);
    }, err => this.disableBtn = false)
  }
}
