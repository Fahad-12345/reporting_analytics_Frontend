import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';
import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatOption } from '@angular/material/core';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { RequestService } from '@appDir/shared/services/request.service';
import { Socket } from 'ngx-socket-io';
import { ToastrService } from 'ngx-toastr';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-comments-invoice',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent extends PermissionComponent implements OnInit {
  userDetail :any = {};	
	comments:any[]= [];
	categories:any[] = [];
	form: FormGroup;
	subscription: Subscription[] =[];
	scrollDistance = 1;
	scrollUpDistance = 1;
	throttle = 300;
	infiniteScrollDisabled :boolean = false;
	allCommentsInformation: any = {};
	presentPage: number = 1;
	@ViewChild('scrollComments') commentScroll:ElementRef;
	@ViewChild('allSelected') private allSelected: MatOption;
	@ViewChild('searchUser') searchUserElement:any
	selectedCategories:any[] =[];
	scrollToBottomIconShow:boolean = false;
	showCategory:boolean = false;

	addCategoryList:any[] = [] ;
	selectedUserForComment:any[]=[];
	searchUsers:string;
	searchedUsers:any[]=[];
	disabledFilterComment:boolean = false;
	disalberesetComment: boolean =false;
	commentAdded: boolean = false;
	secondComment: number =0;
	@Input() caseId:number;

	editCommentData : any; 
	@Input() objectId: number;
	loadSpin:boolean = false;
  constructor(
		public socket: Socket,
		private  fb: FormBuilder,
		protected requestService: RequestService,
		private caseFlowServiceService:CaseFlowServiceService,
		private toastrService: ToastrService,
		public storageData?: StorageData,
		){
			super()
		this.userDetail = {id: this.storageData.getUserId()};
		this.form = this.fb.group(this.formElements());
		this.getCategories();


	}

  ngOnInit() {
  }
  selectedUsers($event) {
		this.selectedUserForComment.push($event.item);
		this.searchUsers = null;
	}
  resetComments(){
		this.disabledFilterComment = true;
		this.presentPage =1;
		this.selectedCategories = [];
		this.searchedUsers = [];
		this.searchUsers = null;
		this.getComments();
	}
  formElements(): Object {
		return {
			'comment': ['', Validators.required],
			'category_ids': [[]],
			'case_id': [null],
			'object_id':[null],
		};
	}
  showCommentsDetails(comment:string,commentData?) {
		let comments;
		if (commentData && commentData.added_by){
		comments  = `<span class='d-block text-word-wrap'>${comment}</span><span class='d-block text-word-wrap'><b>Added By:</b> ${commentData.added_by} <b>Added Date:</b> ${commentData.green_bill_created_at}</span>` 
		}
		else {
			comments = comment;
		}
		return `<span class='text-word-wrap'>${comments}</span>`;
	}
  getComments (page=1,invoiceId?:number) {}
  refreshComments(){}
  scrollDownCaseComments(){}
  scrollUpCaseComments(){}
  getCategories(){}
  disabledCommentTimeOut(comment){}
  deleteComment(comment){}
  editComment(comment){}
  selectedAllValuesCaseComment($event:any[]){}
  addComments(){}
  scrollToBottom(time = 1500){}
  onKey(event) {	
		debugger;	
		if (this.form.value.comment==='' || this.form.value.comment===null ){
			this.editCommentData = null;
			//this.addCategoryList = [];
		}
		
	  }
}
