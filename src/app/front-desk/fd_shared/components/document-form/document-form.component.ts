import { Component, OnInit, ViewChild } from '@angular/core';
import { FileSystemFileEntry, FileSystemDirectoryEntry } from 'ngx-file-drop';
import { NgbModal, NgbModalOptions, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { FDServices } from '../../services/fd-services.service';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Logger } from '@nsalaun/ng-logger';
import { ToastrService } from 'ngx-toastr';
import { Directory } from '../tree-view/Directory';

@Component({
  selector: 'app-document-form',
  templateUrl: './document-form.component.html',
  styleUrls: ['./document-form.component.scss']
})
export class DocumentFormComponent implements OnInit {

  @ViewChild("content") contentModal: any;
  modalRef: NgbModalRef;
  public form: FormGroup;
  public files: any[] = [];
  private caseId: number = 1
  public documentTypes: any[] = [];
  base64textString = [];
  public documents: any[] = [];
  directories: Array<any>;
  private imageSrc: string = '';

  constructor(private modalService: NgbModal, private fd_services: FDServices, private fb: FormBuilder, private logger: Logger, private toasterService: ToastrService
  ) {
    this.form = this.fb.group({
      caseId: this.caseId,
      base64Code: '',
      type: ['', [Validators.required]],
      ext: '',
      description: ['', [Validators.required, Validators.maxLength(100)]]
    })

    let fall2014 = new Directory('Fall 2014', [], ['image1.jpg', 'image2.jpg', 'image3.jpg']);
    let summer2014 = new Directory('Summer 2014', [], ['image10.jpg', 'image20.jpg', 'image30.jpg']);
    let pics = new Directory('Pictures', [summer2014, fall2014], []);
    let music = new Directory('Music', [], ['song1.mp3', 'song2.mp3']);
    let tutorials = new Directory('Tutorials', [pics], [])
    let test = new Directory('Exam', [tutorials], [])
    this.directories = [test, music];
    this.logger.log('directorys', this.directories)
  }

  ngOnInit() {
    this.setDocumentTypes();
    this.getDocuments();
  }

  setDocumentTypes() {
    this.documentTypes = ["Picture ID", "Insurance Card", "Referral Forms", "Police Report", "Authorization Forms", "C3 Forms", "Other Documents"];
  }

  getDocuments() {
    this.fd_services.getDocuments(this.caseId).subscribe(res => {
      this.logger.log(res);
      this.documents = res.data
    }, err => {
      this.toasterService.error(err.error.error.message, 'Error')
    })
  }



  public dropped(event: any, content) {
    this.files = event.files;
    for (const droppedFile of event.files) {

      // Is it a file?
      if (droppedFile.fileEntry.isFile) {
        const fileEntry = droppedFile.fileEntry as FileSystemFileEntry;
        fileEntry.file((file: File) => {

          // Here you can access the real file
          //Get Extension from file 
          let ext = file.type.split('/');
          this.form.patchValue({ ext: ext[1] })
          //Convert file to base64
          const reader = new FileReader();
          reader.onload = this.handleReaderLoaded.bind(this);
          reader.readAsDataURL(file);

        });
      } else {
        // It was a directory (empty directories are added, otherwise only files)
        const fileEntry = droppedFile.fileEntry as FileSystemDirectoryEntry;
      }
    }

    // this.mediaModal.show(); 
    this.handleEvent(content);
  }

  handleReaderLoaded(e) {
    // this.base64textString.push('data:image/png;base64,' + btoa(e.target.result));
    let reader = e.target;
    this.imageSrc = reader.result;
    let filecode = this.imageSrc.split(',');
    this.imageSrc = filecode[1]
    this.form.patchValue({
      base64Code: this.imageSrc
    })
  }

  public fileOver(event) {
  }

  public fileLeave(event) {
  }

  handleEvent = (content): void => {
    let ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false, size: 'lg', windowClass: 'modal_extraDOc'
    };
    this.modalRef = this.modalService.open(content, ngbModalOptions);
  }

  onSubmit(form) {

    if (this.form.valid) {
      this.logger.log('form', form)

      // const formData = new FormData()
      // formData.append('file', form.file)
      // formData.append('caseId', form.caseId)
      // formData.append('description', form.description)
      // let ext = form.file.type.split('/');
      // formData.append('ext', ext[1])
      // formData.append('type', form.type)


      this.fd_services.uploadDocument(form).subscribe(res => {
        if (res.statusCode == 200) {
          this.form.reset();
          this.modalRef.close();
          this.getDocuments()
          this.toasterService.success('Successfully Uploaded', 'Success');
        }
      }, err => {
        this.toasterService.error(err.error.error.message, 'Error')
      })

    } else {
      this.fd_services.touchAllFields(this.form);
    }

  }
}
