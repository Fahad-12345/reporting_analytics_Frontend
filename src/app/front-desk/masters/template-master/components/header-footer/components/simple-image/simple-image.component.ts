import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { SimpleUploadImageComponent } from './modal/simple-upload-image/simple-upload-image.component';
import { LayoutService } from '../../services/layout.service';
import { MainServiceTemp } from '../../services/main.service';
import { environment } from '../../environments/environment';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { Config } from "@appDir/config/config";

declare var cv;

@Component({
  selector: 'app-simple-image',
  templateUrl: './simple-image.component.html',
  styleUrls: ['./simple-image.component.scss']
})
export class SimpleImageComponent implements OnInit {
  object: any = {};
  public showModal = false;
  public raw: any;
  constructor(public openModal: NgbModal,
    public layoutService: LayoutService,
    public mainService: MainServiceTemp,
    public cdr: ChangeDetectorRef,
    private config: Config,
  ) { }
  base64Img: any = '';

  ngOnInit() {
    this.showModal = true;
    if (!this.object.path && this.object.firstTime) {
      this.object.firstTime = false;
      const imageModal = this.openModal.open(SimpleUploadImageComponent, {
        size: 'lg', backdrop: 'static',
        keyboard: true
      })
      imageModal.componentInstance.imageModal = imageModal;
      imageModal.componentInstance.openObject = JSON.parse(JSON.stringify(this.object));
      imageModal.componentInstance.originalRaw = JSON.parse(JSON.stringify(this.base64Img));
      imageModal.result.then((result) => {
        console.log(result); // this is where you can capture your modal activity
        if (result != 'cancel') {
          this.base64Img = JSON.parse(JSON.stringify(this.layoutService.imageObj.raw))
          delete this.layoutService.imageObj.raw;
          this.object.path = JSON.parse(JSON.stringify(this.layoutService.imageObj.path));
          this.raw = this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + this.object.path;
          this.cdr.detectChanges()
        }
      });
    } else {
      this.raw = this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + this.object.path;
    }
  }

  openImage() {
    if (this.layoutService.openTemplate) {
      const imageModal = this.openModal.open(SimpleUploadImageComponent, {
        size: 'lg', backdrop: 'static',
        keyboard: true
      })
      imageModal.componentInstance.imageModal = imageModal;
      imageModal.componentInstance.openObject = JSON.parse(JSON.stringify(this.object));
      imageModal.componentInstance.originalRaw = JSON.parse(JSON.stringify(this.base64Img));
      imageModal.result.then((result) => {
        console.log(result); // this is where you can capture your modal activity
        if (this.layoutService.imageObj && this.layoutService.imageObj.raw) {
          this.base64Img = JSON.parse(JSON.stringify(this.layoutService.imageObj.raw))
          delete this.layoutService.imageObj.raw;
          this.object.path = JSON.parse(JSON.stringify(this.layoutService.imageObj.path));
          this.raw = this.config.getConfig(REQUEST_SERVERS.templateManagerUrl) + this.object.path;


        } else {
          return;
        }
      });
    }
  }
}
