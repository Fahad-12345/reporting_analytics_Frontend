import { Directive, HostListener, Output, EventEmitter, Input } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DocumentUploaderModalComponent } from '../components/document-uploader-modal/document-uploader-modal.component';
import { FolderModel } from '../Models/FolderModel.Model';
import { ToastrService } from 'ngx-toastr';
import { FileUploaderModalComponent } from '@appDir/manual-specialities/file-uploader-modal/file-uploader-modal.component';
// import { FileUploaderModalComponent } from '../components/file-uploader-modal/file-uploader-modal.component';

@Directive({
  selector: '[dropzone]'
})
export class FileUploadDirective {

  @Output() dropped = new EventEmitter<FileList>();
  @Output() hovered = new EventEmitter<boolean>();
  @Output() referesh_doc = new EventEmitter<boolean>();

  @Input() folder: FolderModel;
  @Input() caseId: number;
  @Input() patientId: number;
  @Input() type: 'document-manager' | 'manual-speciality' = 'document-manager';
  @Input() speciality_name: string;
  @Input() speciality_id: string;
  @Input() appointment_location_id: string
  @Input() hasPermission:boolean=true;
  @Input() visit_session_id: string;
  @Input() lstFolder:FolderModel[]=[];
  constructor(private modal: NgbModal, private toasterService: ToastrService) { }

  @HostListener('drop', ['$event'])
  onDrop($event) {
    $event.preventDefault();
	// this.dropped.emit($event.dataTransfer.files);
	if(!this.hasPermission){
		this.toasterService.error('User does not have permission to perform this task','Error')
		return;
	}
    const files = $event.dataTransfer.files;



    this.hovered.emit(false);
    if (this.areFilesValid(files)) {
      if (this.type == 'manual-speciality') {
        let modalRef = this.modal.open(FileUploaderModalComponent)
        modalRef.componentInstance.files = $event.dataTransfer.files;
		modalRef.componentInstance.case_id=this.caseId;
        modalRef.componentInstance.specialty_name = this.speciality_name;
        modalRef.componentInstance.speciality_id = this.speciality_id;
        modalRef.componentInstance.lstFolder=this.lstFolder;
        modalRef.componentInstance.appointment_location_id = this.appointment_location_id;
		modalRef.componentInstance.visit_session_id=this.visit_session_id
        modalRef.result.then(_res => {
          $event.target.value = ''
		  if(_res)
		  {
			this.referesh_doc.emit(true)
		  }
        })
      } else {
        let modalRef = this.modal.open(DocumentUploaderModalComponent)
        modalRef.componentInstance.folder = this.folder;
        modalRef.componentInstance.files = $event.dataTransfer.files;
        modalRef.componentInstance.caseId = this.caseId;
        modalRef.componentInstance.lstFolder=this.lstFolder;
        modalRef.componentInstance.patientId = this.patientId
        modalRef.result.then(_ => {
          $event.target.value = ''
        })
      }
      return;
    } else {
      this.toasterService.error(`Only files with extension JPG, JPEG, PNG or PDF are allowed.`);

    }

  }

  areFilesValid(files) {
    for (const file of files) {
      let ext = file.type.split('/');
      switch (ext[1] ? ext[1].toLocaleLowerCase() : '') {
        case 'jpg':
        case 'jpeg':
        case 'png':
        case 'pdf':


          break;
        default:
          // this.activeModal.close()
          return false;
      }
    }
    return true;
  }

  @HostListener('dragover', ['$event'])
  onDragOver($event) {
    $event.preventDefault();
    this.hovered.emit(true);
  }

  @HostListener('dragleave', ['$event'])
  onDragLeave($event) {
    $event.preventDefault();
    this.hovered.emit(false);
  }
}
