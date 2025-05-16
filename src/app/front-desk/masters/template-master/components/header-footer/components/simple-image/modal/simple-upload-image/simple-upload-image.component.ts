import { Component, OnInit, Input } from '@angular/core';
import { MainServiceTemp } from '../../../../services/main.service';
import { ToastrService } from 'ngx-toastr';
import { LayoutService } from '../../../../services/layout.service';
import { TemplateMasterUrlEnum } from '@appDir/front-desk/masters/template-master/template-master-url.enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { RequestService } from '@appDir/shared/services/request.service';
declare var cv;
declare var $: any;

@Component({
  selector: 'app-simple-upload-image',
  templateUrl: './simple-upload-image.component.html',
  styleUrls: ['./simple-upload-image.component.css']
})
export class SimpleUploadImageComponent implements OnInit {
  @Input() imageModal;
  @Input() openObject;
  @Input() originalRaw;
  fileData: File = null;
  previewUrl: any = null;
  fileUploadProgress: string = null;
  uploadedFilePath: string = null;
  filePath: any = null;
  data = [];
  constructor(public mainService: MainServiceTemp,
    private toastrService: ToastrService,
    public layoutService: LayoutService,
    protected requestService: RequestService,
  ) { }
  ngOnInit() {
    if (this.openObject && this.openObject.path != '') {
      this.data = this.openObject.data;
      this.previewUrl = this.originalRaw;
      this.uploadedFilePath = this.openObject.path;
      // this.drawRectangle()
    }
  }


  fileProgress(fileInput: any) {
    console.log(fileInput)

    this.filePath = fileInput.target.value;
    this.fileData = <File>fileInput.target.files[0];
    console.log(this.fileData)
    this.preview();
  }


  preview() {
    // Show preview
    if(!this.fileData || !this.fileData.type){
      return;
    }
    var mimeType = this.fileData.type;
    if (mimeType.match(/image\/*/) == null) {
      return;
    }

    console.log(mimeType)
    var reader = new FileReader();

    reader.readAsDataURL(this.fileData);
    console.log(reader)

    reader.onload = (_event) => {
      this.previewUrl = reader.result;
      this.originalRaw = JSON.parse((JSON.stringify(this.previewUrl)))
      this.data = []
    }
  }

  onSubmit() {
    if (this.fileData == null) {
      this.toastrService.success('Successfully uploaded!!');
      this.layoutService.imageObj = { path: this.uploadedFilePath, data: this.data, raw: this.originalRaw }
      this.imageModal.close()
    } else {
      const formData = new FormData();
			formData.append("images", this.fileData, this.fileData.name);
      this.requestService
        .sendRequest(
          TemplateMasterUrlEnum.uploadImage,
          'POST',
          REQUEST_SERVERS.templateManagerUrl,
          formData
        ).subscribe(
          (res: any) => {
            console.log(res);
            this.uploadedFilePath = res.data[0][0].images;
  					this.toastrService.success('Successfully uploaded!!');
  					this.layoutService.imageObj = {
  						path: this.uploadedFilePath,
  						data: this.data,
  						raw: this.originalRaw,
  					};
  					this.imageModal.close();
          })
    }
  }



}
