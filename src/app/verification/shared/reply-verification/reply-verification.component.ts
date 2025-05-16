import { AfterViewInit, Component, Input, OnDestroy, OnInit } from '@angular/core';
import { REQUEST_SERVERS } from '@appDir/request-servers.enum';
import { DatePipeFormatService } from '@appDir/shared/services/datePipe-format.service';
import { RequestService } from '@appDir/shared/services/request.service';
import { removeEmptyAndNullsFormObject, unSubAllPrevious } from '@appDir/shared/utils/utils.helpers';
import { VerificationBillEnum } from '@appDir/verification/verification-bill-enum';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { Subscription, take } from 'rxjs';
import { MESSAGE, RECIPIENT } from './recipients-slugs';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-reply-verification',
  templateUrl: './reply-verification.component.html',
  styleUrls: ['./reply-verification.component.scss']
})
export class ReplyVerificationComponent implements OnInit, OnDestroy {
  loadSpin: boolean = false;
  @Input() verficationReplies: any[] = [];
  @Input () selected :any[]=[]
  subscription: Subscription[] = [];
  selectAll: boolean = false;
  isDisableButton:boolean=true;
  limit:number=10;
  VerificationBillEnum = VerificationBillEnum;
  constructor(private requestService: RequestService,private modalService: NgbModal, public commonService:DatePipeFormatService,
    private toastrService: ToastrService) { }
  ngOnInit(): void {
  }


  checkSelection(row?) {
    if (row?.id) {
      let index = this.verficationReplies.findIndex(reply => reply.id == row.id)
      if (index > -1) {
        this.verficationReplies[index]['selected'] = !this.verficationReplies[index]['selected']
      }
    }
    this.selectAll = !this.verficationReplies.some(replyVerification => !replyVerification?.selected);
    this.isDisableButton=!this.verficationReplies.some((reply:any)=>reply?.selected);
  }

  checkAll() {
    this.selectAll = !this.selectAll;
    this.verficationReplies = this.verficationReplies.map(reply => {
      return {
        ...reply,
        selected: this.selectAll
      }
    })
    this.isDisableButton=!this.selectAll;
  }
  getRecipatentIndex(value: any[] = []) {
    let recpitentIndex = value.findIndex((x) => x.row.recipient_type_slug === RECIPIENT.INSURANCE);
    let recpient = recpitentIndex != -1 ? recpitentIndex : 0;
    return recpient;
  }
  getRecipatentName(row, singleRow?) {
    switch(row?.recipient_type_slug) {
      case RECIPIENT.EMPLOYER:
          return `${row?.recipient?.employer_name}`;
        break;
      case RECIPIENT.LAWYER:
          return `${row?.recipient?.name}`;
        break;
      case RECIPIENT.PATIENT:
          return `${row?.recipient?.first_name} ${row?.recipient?.middle_name ? row.recipient?.middle_name : ''}`;
        break;
      default:
          return `${row?.recipient ? row?.recipient?.insurance_name : ''}`;
    }
  }

  generatePOM() {
    this.loadSpin = true;
    const paramData = {
      is_packet: 2,
      verification_sent_ids: this.verficationReplies
        .filter((reply: any) => reply?.selected)
        .map((reply: any) => ({ bill_id: reply?.bill_id, verification_sent_id: reply?.id })),
      verification_ids: this.selected.map(ver => ver?.id),
      without_bulk: true
    };
    this.subscription.push(
      this.requestService
        .sendRequest(
          VerificationBillEnum.POM_verification,
          'POST',
          REQUEST_SERVERS.fd_api_url,
          removeEmptyAndNullsFormObject(paramData),
        ).subscribe((res: any) => {
          if (res?.status) {
            this.selectAll = false;
            this.loadSpin = false;
            this.toastrService.success(MESSAGE.SUCCESS,'Success')
            this.modalService.dismissAll();
          }
        }, (err) => {
          this.loadSpin = false;
          this.modalService.dismissAll()
        },
        )
    )
  }
  pageLimit($num) {
		this.limit = Number($num);

	}

  ngOnDestroy(): void {
    unSubAllPrevious(this.subscription);
  }
}


