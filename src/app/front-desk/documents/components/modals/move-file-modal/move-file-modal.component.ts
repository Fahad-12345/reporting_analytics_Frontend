import { Component, OnInit, Input, OnChanges, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, RequiredValidator, FormArray } from '@angular/forms';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';
// import { DocumentManagerServiceService } from '../../services/document-manager-service.service';
// import { FolderModel } from '../../Models/FolderModel.Model';
import { ToastrService } from 'ngx-toastr';
import { DocumentManagerServiceService } from '../../../services/document-manager-service.service';
import { FolderModel } from '../../../Models/FolderModel.Model';
import { NewFolderModalComponent } from '../new-folder-modal/new-folder-modal.component';
// import { NewFolderModalComponent } from '../new-folder-modal/new-folder-modal.component';

@Component({
  selector: 'app-move-file-modal',
  templateUrl: './move-file-modal.component.html',
  styleUrls: ['./move-file-modal.component.scss']
})
export class MoveFileModalComponent implements OnInit {

  constructor(private fb: FormBuilder, private activeModal: NgbActiveModal, private documentManagerService: DocumentManagerServiceService, private toasterService: ToastrService, private modalService: NgbModal) { }
  form: FormGroup
  @Input() folder: FolderModel;
  @Input() folders: FolderModel[];
  // @Input() files: any[] = []
  lstFolder: FolderModel[] = []
  lstSubFolders: FolderModel[][] = []
  uploadFiles: any[] = [];
  disableBtn: boolean = false;
  @Input() caseId: number;
  @Input() patientId: number;
  @Input() onsubmit: any;
  @Output() refreshModelFolders: EventEmitter<any> = new EventEmitter();

  ngOnInit() {
    // console.log(this.folder, this.files)
    this.initForm()

    this.bindFolderChange()

    // this.handleFiles()
    // if (this.files.length == 1) {
    //   this.form.patchValue({ fileTitle: this.files[0].name })
    //   this.form.controls['fileTitle'].setValidators(Validators.required)
    // }




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
      console.log(this.folders);
      this.lstFolder = this.folders;
      return;
      this.documentManagerService.getAllFolders(this.caseId, 'patientCases').subscribe(data => {
        this.lstFolder = data['data']
      })
    }


  }

  // handleFiles() {
  //   for (const file of this.files) {
  //     let ext = file.type.split('/');
  //     switch (ext[1] ? ext[1].toLocaleLowerCase() : '') {
  //       case 'jpg':
  //       case 'jpeg':
  //       case 'png':
  //       case 'pdf':

  //         const reader = new FileReader();
  //         reader.onload = this.handleReaderLoaded.bind(this);
  //         reader.readAsDataURL(file);
  //         break;
  //       default:
  //         this.toasterService.error(`Only files with extension JPG, JPEG, PNG or PDF are allowed.`);
  //         // this.activeModal.close()
  //         return;
  //     }
  //   }
  // }

  handleReaderLoaded(e, id) {
    let reader = e.target;
    let imageSrc = reader.result;
    let filecode = imageSrc.split(',');
    imageSrc = filecode[1]
    let ext = filecode[0].split('/');
    let ext1 = ext[1].split(';')



    this.uploadFiles.push({ file: imageSrc, ext: ext1[0] })

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
          folder['child'] = folder.children_recursive;
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

  createFolder() {
    let modalRef = this.modalService.open(NewFolderModalComponent)
    modalRef.componentInstance.caseId = this.caseId;
    modalRef.componentInstance.patientId = this.patientId;
    let folderId = this.form.getRawValue().parentId;
    let folder = this.lstFolder.find(folder => folder.id == folderId)
    this.form.getRawValue().sfolderId.forEach((subfolder, index) => {
      if (subfolder.id) {
        folderId = subfolder.id
        folder = this.lstSubFolders[index].find(folder => folder.id == folderId)
      }
    })
    modalRef.componentInstance.folder = folder
    modalRef.componentInstance.caseId = this.caseId;

    modalRef.result.then(newfolder => {
      if (newfolder) {
        folder.child ? folder.child.push(newfolder) : folder.child = [newfolder]
        this.form.patchValue(this.form.getRawValue());
        modalRef.componentInstance.refreshModelFolders.subscribe((value) => {
          this.refreshModelFolders.emit(true);
        });
      }
    })
  }


  ngOnChanges() {
    // if (this.folderId) {
    //   this.documentManagerService.getFilesFromFolderId(this.folderId).subscribe(data => {
    //     console.log(data)
    //   })
    // }
  }

  initForm() {
    this.form = this.fb.group({
      // fileTitle: ['', [Validators.required]],
      // fileTitle: [''],
      // tags: [[]],
      // description: [''],
      parentId: ['', [Validators.required]],
      sfolderId: this.fb.array([]),
      ext: ['']
    });
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
      // return;
      // }

      let folder = this.lstSubFolders[index].find(folder => folder.id == value)



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
      })
      // }
    // })
  }

  submitForm(form) {
    this.disableBtn = true;
    form = this.form.getRawValue()

    let folderId = form.parentId;
    form.sfolderId.forEach(subfolder => {
      if (subfolder.id) {
        folderId = subfolder.id
      }
    })

    let requestData = {
      fileName: form.fileTitle,
      folderId: folderId
    }

    this.onsubmit(requestData)

  }
}
