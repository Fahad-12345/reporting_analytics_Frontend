import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { LayoutService } from '../../services/layout.service';
import { DomSanitizer } from '@angular/platform-browser';
import { TemaplateManagerUrlsEnum } from '@appDir/template-manager/template-manager-url-enum';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { HttpSuccessResponse, StorageData } from '@appDir/pages/content-pages/login/user.class';
import { SubjectService } from '../../services/subject.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { AssignSpecialityUrlsEnum } from '@appDir/scheduler-front-desk/modules/assign-speciality/assign-speciality-urls-enum';
import { convertDateTimeForRetrieving } from '@appDir/shared/utils/utils.helpers';

@Component({
  selector: 'app-input',
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss']
})
export class InputComponent implements OnInit {
  object: any = {};
  editText: any = false;
  boundStatement: any = "";
  // textStatement: any = "";
  paraClickCheck = false;
  user_id: any = "";
  data: any = [];
  constructor(public changeDetector: ChangeDetectorRef, public layoutService: LayoutService, protected requestService: RequestService, private storageData: StorageData,
    public subject: SubjectService, private sanitizer: DomSanitizer) { }
  ngOnInit() {
    //console.log("---- " + this.object)
    this.user_id = this.storageData.getUserId();
    this.boundStatement = this.object.statement;
    // this.textStatement = this.object.statement;
    //console.log(this.boundStatement)
    if (this.object.preDefind && false) {
      const scheduler = this.storageData.getSchedulerInfo();
      let templateObj = scheduler.template_instance;
      if (!templateObj) {
        templateObj = {};
      }
      this.object.preDefinedObj['value'] = 'N/A'

      if (this.object.preDefinedObj.slug == 'office_location_address') {
        this.requestService
          .sendRequest(
            AssignSpecialityUrlsEnum.Facility_list_Post,
            'POST',
            REQUEST_SERVERS.schedulerApiUrl,
            { 'clinics': [templateObj.location_id] }
          ).subscribe(
            (response: HttpSuccessResponse) => {
              this.object.preDefinedObj['value'] = response.result.data.docs[0].address;

              this.changeDetector.detectChanges()
            },
          )
      } else if (this.object.preDefinedObj.slug == 'next_appt' || this.object.preDefinedObj.slug == 'last_apt') {
        this.requestService
          .sendRequest(
            TemaplateManagerUrlsEnum.getNextAndLastAppointmentAgainstCase,
            'POST',
            REQUEST_SERVERS.schedulerApiUrl,
            { "case_ids": [templateObj.case_id] }
          ).subscribe(
            (response: HttpSuccessResponse) => {
              this.object.preDefinedObj['value'] = 'N/A';
              if (this.object.preDefinedObj.slug == 'next_appt' && response.result.data[0].nextScheduledAppointment != null) {
                this.object.preDefinedObj['value'] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data[0].nextScheduledAppointment.startDateTime))
              } else {
                this.object.preDefinedObj['value'] = convertDateTimeForRetrieving(this.storageData, new Date(response.result.data[0].lastDoneAppointment.startDateTime))
              }
              this.changeDetector.detectChanges()

            })
      } else if (templateObj[this.object.preDefinedObj.slug]) {
        this.object.preDefinedObj['value'] = templateObj[this.object.preDefinedObj.slug]
      } else {
        this.object.preDefinedObj['value'] = 'N/A'
      }
      if (this.object.preDefinedObj.slug == 'npino') {
        this.requestService
          .sendRequest(
            TemaplateManagerUrlsEnum.getNpinoAgainstUser + this.user_id,
            'GET',
            REQUEST_SERVERS.fd_api_url,
          ).subscribe(
            (response: HttpSuccessResponse) => {
              if (response.result && response.result.data && response.result.data.npi) {
                this.object.preDefinedObj['value'] = response.result.data.npi;
              } else {
                this.object.preDefinedObj['value'] = 'N/A'
              }
              this.changeDetector.detectChanges()

            })
      }
      if (this.object.preDefinedObj.slug == 'dos_date_of_service') {
        this.requestService
          .sendRequest(
            TemaplateManagerUrlsEnum.getVisitTypesRoute + templateObj.case_id + "&appointment_id=" + templateObj.id,
            'GET',
            REQUEST_SERVERS.fd_api_url,
          ).subscribe(
            (response: HttpSuccessResponse) => {
              if (response.result && response.result.data) {
                this.object.preDefinedObj['value'] = response.result.data.visit_date;
              } else {
                this.object.preDefinedObj['value'] = 'N/A'
              }
              this.changeDetector.detectChanges()

            })
      }
      this.object.statement = this.object.preDefinedObj.title;
      this.object.input = this.object.preDefinedObj.value;
      this.addAnswer({ target: { value: this.object.preDefinedObj['value'] } })
    } else if (this.object.preDefind) {
      this.object.preDefinedObj['value'] = 'N/A'
      this.object.statement = this.object.preDefinedObj.title;
      this.object.input = this.object.preDefinedObj.value;
      this.addAnswer({ target: { value: this.object.preDefinedObj['value'] } })
    }
  }

  textClick() {
    if (this.layoutService.openTemplate) {
      let textArea = document.getElementById('inputText' + this.object.uicomponent_name);
      this.boundStatement = textArea.innerText;
      // this.textStatement = textArea.innerHTML;
      this.editText = true;
      this.paraClickCheck = true;
    }
  }
  textClickInput() {
    if (this.layoutService.openTemplate) {
      let textArea = document.getElementById('inputText' + this.object.uicomponent_name);
      this.boundStatement = textArea.innerText;
      this.editText = true;
      this.paraClickCheck = true;
    }
  }
  textAreaClick() {
    if (this.layoutService.openTemplate) {

      if (!this.paraClickCheck) {
        let textArea: any = document.getElementById('inputText' + this.object.uicomponent_name);
        if (textArea.innerText != this.boundStatement) {
          textArea.innerText = this.boundStatement;
        }
        this.object.statement = this.sanitizer.bypassSecurityTrustHtml(textArea.innerHTML);
        this.editText = false;
      } else {
        this.paraClickCheck = false;
      }
    }
  }
  editStatement() {
    this.editText = false;
  }

  async addAnswer(e) {
    let target = e;
    if (e.target) {
      target = e.target.value;
    }
    let tempChars = target.replace(/\r\n/g, "\r").replace(/\n/g, "\r").split(/\r/);
    let tempLength = target.length + (tempChars.length * 30) - (tempChars.length + 30);

    for (let i = 0; i < this.layoutService.section.length; i++) {
      for (let j = 0; j < this.layoutService.section.dashboard.length; j++) {
        if (this.layoutService.section.dashboard[j].obj.type == "input" &&
          this.layoutService.section.dashboard[j].obj.uicomponent_name === this.object.uicomponent_name) {
          this.layoutService.lastK = j;
          if (tempLength > 1000) {
            if (this.layoutService.section.dashboard[j].obj.answers[0]) {
              target = this.layoutService.section.dashboard[j].obj.answers[0].answer;
            } else {
              target = '';
            }
            let textArea: any = document.getElementById('textAreaBottom' + this.object.uicomponent_name);
            textArea.value = target;
            this.layoutService.section.dashboard[j].obj.input = target;
            this.changeDetector.detectChanges();
            return;

          }
          this.layoutService.section.dashboard[j].obj.answers = [];

          break;
        }
      }
    }
    for (let x = 0; x < this.layoutService.section.length; x++) {
      for (let i = 0; i < this.layoutService.section.dashboard.length; i++) {
        if (this.layoutService.section.dashboard[i].obj.type == "text") {
          let tempStatement = ""
          // } else {
            tempStatement = this.layoutService.section.dashboard[i].obj.statement
          // }
          let arr = tempStatement.split('>').join('> ').split('<').join(' <').split(" ").join(',').split('.').join(',').split("\n").join(',').split(',')
          for (let j = 0; j < arr.length; j++) {
            if (arr[j][0] == "@") {
              arr[j] = arr[j].replace('@', '');
              for (let z = 0; z < this.layoutService.section.length; z++) {
                for (let k = 0; k < this.layoutService.section.dashboard.length; k++) {
                  if (arr[j] == this.layoutService.section.dashboard[k].obj.uicomponent_name) {
                    let answer = '';
                    for (let l = 0; l < this.layoutService.section.dashboard[k].obj.answers.length; l++) {
                      if (this.layoutService.section.dashboard[k].obj.type == "intellisense") {
                        answer = answer + this.layoutService.section.dashboard[k].obj.answers[l].label + " "
                      }
                      else {
                        answer = answer + this.layoutService.section.dashboard[k].obj.answers[l].answer + " "
                      }
                    }
                    arr[j] = answer
                    if (this.layoutService.section.dashboard[i].obj.isBold) {
                      arr[j] = "<b>" + arr[j] + "</b>"
                    }
                    if (this.layoutService.section.dashboard[i].obj.isItalic) {
                      arr[j] = "<i>" + arr[j] + "</i>"
                    }
                    if (this.layoutService.section.dashboard[i].obj.isUnderline) {
                      arr[j] = "<u>" + arr[j] + "</u>"
                    }
                  }
                }
              }
            }

          }

          this.layoutService.section.dashboard[i].obj["instanceStatement"] = arr.join(" ");
          arr = [];
        }
      }
    }

    await this.subject.instanceRefreshCheck('tick');
  }


}
