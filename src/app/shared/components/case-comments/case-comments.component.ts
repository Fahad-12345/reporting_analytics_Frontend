import { Socket } from 'ngx-socket-io';
import { isEmpty } from '@appDir/shared/utils/utils.helpers';

import { ToastrService } from 'ngx-toastr';
import { GeneralSharedEnum } from './../general.enum';
import { REQUEST_SERVERS } from './../../../request-servers.enum';
import { CaseFlowUrlsEnum } from './../../../front-desk/fd_shared/models/CaseFlowUrlsEnum';
import { CaseFlowServiceService } from './../../../front-desk/fd_shared/services/case-flow-service.service';
import { RequestService } from './../../services/request.service';
import { MatOption } from '@angular/material/core';
import { map } from 'rxjs/operators';
import { Subscription, fromEvent } from 'rxjs';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { StorageData } from '@appDir/pages/content-pages/login/user.class';
import { Component, OnInit, ViewChild, ElementRef, Input } from '@angular/core';
import { AclService } from '@appDir/shared/services/acl.service';
import { PermissionComponent } from '@appDir/front-desk/permission.abstract.component';

// let $: any;
declare var $:any;

@Component({
	selector: 'app-comments',
	templateUrl: './case-comments.component.html',
	styleUrls: ['./case-comments.component.scss']
})

export class CommentsModalComponent extends PermissionComponent  implements OnInit {
	userDetail :any = {};	
	comments:any[]= [];
	categories:any[] = [];
	form: FormGroup;
	subscription: Subscription[] =[];
	scrollDistance = 1;
	scrollUpDistance = 1;
	label='';
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
	slug:string='';
	addCategoryList:any[] = [] ;
	selectedUserForComment:any[]=[];
	searchUsers:string;
	searchedUsers:any[]=[];
	disabledFilterComment:boolean = false;
	disalberesetComment: boolean =false;
	commentAdded: boolean = false;
	secondComment: number =0;
	@Input() caseId:number;
	@Input() showCategoryByDefault:boolean=false;

	editCommentData : any; 
	@Input() objectId: number;
	loadSpin:boolean = false;
	
	
	constructor(
		public socket: Socket,
		aclService: AclService,
		private  fb: FormBuilder,
		protected requestService: RequestService,
		private caseFlowServiceService:CaseFlowServiceService,
		private toastrService: ToastrService,
		public storageData?: StorageData,	
		){
			super(aclService)
		this.userDetail = {id: this.storageData.getUserId()};
		this.form = this.fb.group(this.formElements());
		this.getCategories();
	}

	ngOnInit(){
		this.socket.on('UPDATECASECOMMENTLISTING', (message) => {
			debugger;

			if (message.action && message && message.comment_data){
				this.setActionSockets(message.comment_data,message.action)
				let msgHistory = document.getElementById('msg_history');
				if (msgHistory && msgHistory.scrollTop){
				msgHistory.scrollTop = msgHistory && msgHistory.scrollHeight? msgHistory.scrollHeight:0;	
				}			
				// this.scrollToBottom(50);
			}					
		});

		this.socket.on('UPDATEBILLINGCASECOMMENTLISTING', (message) => {
			debugger;

			if (message.action && message && message.comment_data){
				this.objectId = message.bill_id;
				this.setActionSockets(message.comment_data,message.action,message.bill_id);
				let msgHistory = document.getElementById('msg_history');
				if (msgHistory && msgHistory.scrollTop){
				msgHistory.scrollTop = msgHistory && msgHistory.scrollHeight? msgHistory.scrollHeight:0;	
				}	
				// this.scrollToBottom(50);
			}					
		});

		this.socket.on('UPDATEINVOICECOMMENTLISTING', (message) => {
			debugger;

			if (message.action && message && message.comment_data){
				this.objectId = message.invoice_id;
				this.setActionSockets(message.comment_data,message.action,message.invoice_id);
				let msgHistory = document.getElementById('msg_history');
				if (msgHistory && msgHistory.scrollTop){
				msgHistory.scrollTop = msgHistory && msgHistory.scrollHeight? msgHistory.scrollHeight:0;	
				}	
				// this.scrollToBottom(50);
			}					
		});
	}

	setActionSockets (commentInfo, actions,object_id?){

		switch (actions){
			case 'created': {
				let index = this.comments.findIndex(comment=>comment.id === commentInfo.id);
				this.form;
				if (index == -1){
					this.comments.push(commentInfo);
					// if (this.objectId){
					// 	this.comments.push(commentInfo);
				    // //   this.objectId===object_id?this.comments.push(commentInfo):'';
					// }
					// else {
					// 	this.comments.push(commentInfo);
					// 	this.comments= [...this.comments];
					// }
					if (this.allCommentsInformation && this.allCommentsInformation.data && this.allCommentsInformation.data.total){

						this.allCommentsInformation.data.total = this.allCommentsInformation.data.total +1;
					}

				}
				break; 
			}

			case 'updated': {
				let index = this.comments.findIndex(comment=>comment.id === commentInfo.id);
				if (index>-1){
					this.comments[index] = commentInfo;
				}

				break; 
			}
			case 'deleted' : {
				let index = this.comments.findIndex(comment=>comment.id === commentInfo);
				console.log(this.allCommentsInformation);
				if (index>-1){
					this.comments.splice(index,1);
					this.comments = [...this.comments];
					this.loadSpin= false;
					if (this.allCommentsInformation && this.allCommentsInformation.data && this.allCommentsInformation.data.total){
						this.allCommentsInformation.data.total = this.allCommentsInformation.data.total -1;
					}
					// this.allCommentsInformation['data']['total'] = this.allCommentsInformation['data']['total']-1;

				}
				break;
			}

		}

	}

ngAfterViewInit(): void {
		const content = document.querySelector('.msg_history');
		const scroll$ = fromEvent(content, 'scroll').pipe(map(() => content));

		scroll$.subscribe((element) => {
		  let threshold = 800;
		  // setTimeout(() => {
		  let top, offSetHeight, scrollHeight = 0;
		  //Get the Value of scroll position
		  top = this.commentScroll.nativeElement.scrollTop;
		  //Get the Height of the Element.This property normally  include padding and margin
		  offSetHeight = this.commentScroll.nativeElement.offsetHeight;
		  // ScrollHeight is a measurement of the height of an element's content including
		  scrollHeight = this.commentScroll.nativeElement.scrollHeight;
		  // content not visible on the screen due to overflow
		  //  console.log('Top:'+this.top,'Scroll height:'+this.eleRef.nativeElement.scrollHeight,'offsetHEight:'+this.offSetHeight);
		  //IF the scroll position is zero which means it is at the top 
		  if (top === 0) {
		  }
		  //check the scroll at bottom or top
		  if (top > scrollHeight - offSetHeight - 250) {
			// this.scrollToBottomIconShow = false;
			this.scrollToBottomIconShow=false;
		
		  } 
		  else {
			if (this.comments.length > 0) {
			//   this.scrollToBottomIconShow = true;
			  if (this.comments.length > 0) {
				this.scrollToBottomIconShow = true;
			  }
			}
	
		  }
	
		});
	  }
	formElements(): Object {
		return {
			'comment': ['', Validators.required],
			'category_ids': [[]],
			'case_id': [null],
			'object_id':[null],
		};
	}

	selectedAllValuesCaseComment($event:any[],$billSelection?){
		if($billSelection){
			this.selectedCategories= $event.map(category=> category);
		}else{
			this.addCategoryList = [...$event.map(category=>{
				return category.id
			})];
		}
	}

	getSingleComment(formData){
		this.subscription.push(
			this.requestService.sendRequest(CaseFlowUrlsEnum.getSingleComment, 'get', REQUEST_SERVERS.kios_api_path,formData).subscribe(
				(res:any) => {
					debugger;
					if (res && res.status){
					this.editCommentData = res.result.data;
					this.form.controls['comment'].setValue(this.editCommentData.comment);
					
				    
					this.addCategoryList = [...this.editCommentData.comment_category.map(comment=>{
						return comment.category_id
				
					})];
					}
				},
				(err) => {
				},
			),
		);
	}
	getCategories(){
		if (this.caseFlowServiceService.commentsCategory.length ==0){

		this.subscription.push(
			this.requestService.sendRequest(CaseFlowUrlsEnum.getCommentsCategories, 'get', REQUEST_SERVERS.kios_api_path).subscribe(
				(res:any) => {
					this.categories = res.result.data;
					this.caseFlowServiceService.commentsCategory = this.categories;

				},
				(err) => {
				},
			),
		);
			}
			else {
				this.categories= this.caseFlowServiceService.commentsCategory;
					
			}	
	}
	
	scrollDownCaseComments() {
	}
	
	scrollUpCaseComments() {

		if (this.comments.length !== this.allCommentsInformation['data']['total'])
		{
        this.presentPage = this.presentPage + 1;
        this.infiniteScrollDisabled = true;
		this.getComments(this.presentPage);
		this.commentScroll.nativeElement.scroll({
			top: (this.commentScroll.nativeElement.scrollHeight/7),
            left: 0,
            behavior: "smooth"
		  });
	  }
	
	}

	toggleAllSelection() {
		if (this.allSelected.selected) {
		  this.form.controls.category_ids
			.patchValue([...this.categories.map(item =>item.id), 0]);
		} else {
		  this.form.controls.category_ids.patchValue([]);
		}
	  }

	  selectedUsers($event) {
		this.selectedUserForComment.push($event.item);
		this.searchUsers = null;
	}
	changeUser($event){
	}
	searchUsersInformation(event) {
		let value = event.term;
		let params = {
			name: value,
			pagination:0
		}
			this.subscription.push(
				this.requestService.sendRequest(GeneralSharedEnum.getUsersInteli, 'get',REQUEST_SERVERS.fd_api_url,params).subscribe(
					(res:any) => {

							this.searchedUsers = [...res.result.data];
							this.searchedUsers.map(user=> {user ? user['full_name']=user.first_name+' '+(user.middle_name?user.middle_name+' ':null)+user.last_name: ''})
							
						

						
						
					},
					(err) => {
					},
				),
			);
		
	}

	  tosslePerOne(all){ 
		if (this.allSelected.selected) {  
		 this.allSelected.deselect();
		 return false;
	 }
	   if(this.form.controls.category_ids && Array.isArray(this.form.controls.category_ids) && this.form.controls.category_ids.length ==this.categories.length)
		 this.allSelected.select();
	 
	 }
	
	  scrollToBottom(time = 1500): void {
    try {
      setTimeout(() => {
        // this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        $('.msg_history').animate({
          scrollTop: this.commentScroll.nativeElement.scrollHeight
        }, time);
      }, 0);

    } catch (err) { }
  }

 
	addComments() {

		let params  = {} = this.form.value;
		if (this.addCategoryList.length === 0) {
			this.toastrService.error('Select Comment Category', 'Error');
			return;
		}
		if (this.caseId){
			params ['case_id'] = this.caseId;
		}
		else {
		 params ['case_id']= this.caseFlowServiceService && this.caseFlowServiceService.case?this.caseFlowServiceService.case.id:null;
		}
		 params['category_ids'] = this.addCategoryList.map(category=>  
			category.id?category.id:category);
		this.commentAdded = true;
		if (!isEmpty(this.editCommentData)){
			params ['id'] = this.editCommentData.id;
			this.subscription.push(
				this.requestService.sendRequest(CaseFlowUrlsEnum.updateComment, 'put', REQUEST_SERVERS.kios_api_path,params).subscribe(
					(res:any) => {
						// this.form.reset();
						this.commentAdded=false;
						this.editCommentData = null;
						this.form.controls['comment'].setValue(null);
						this.editCommentData = null;
						//this.comments=[];
						this.resetCatgories();
						// this.getComments();
						this.scrollToBottom();
					},
					(err) => {
					},
				),
			);
		}
		else {

			
			let selectedCategoriesInAdd=this.categories.filter(category =>  params['category_ids'].includes(category.id));
			if (
				(this.slug === 'billing' && selectedCategoriesInAdd.some(category => category.slug !== 'billing')) ||
				(this.slug === 'invoice' && selectedCategoriesInAdd.some(category => category.slug !== 'invoice'))
			) {
				params['label'] = this.label;
			}
		 this.subscription.push(
			this.requestService.sendRequest(CaseFlowUrlsEnum.createComment, 'post', REQUEST_SERVERS.kios_api_path,params).subscribe(
				(res:any) => {
					// this.form.reset();
					this.commentAdded=false;
					this.form.controls['comment'].setValue(null);
				//	this.comments=[];
					this.resetCatgories();
					// this.getComments();
					this.scrollToBottom();
				},
				(err) => {
				},
			),
		);
	}

	}
	onKey(event) {	
		if (this.form.value.comment==='' || this.form.value.comment===null ){
			this.editCommentData = null;
			//this.addCategoryList = [];
		}
		
	  }

	  editComment(comment) {
		let formData = {
			case_id:comment.case_id,
			comment_id: comment.id,
		};
		this.getSingleComment(formData);
		

	  }
	  disabledCommentTimeOut(comment){

		  if (comment && comment.added_by){  
			  return true;
		  }
		let curentdate = new Date();
		let commentDate = new Date(comment.created_at);
		
		this.secondComment = (curentdate.getTime() - commentDate.getTime())/1000;
		if (this.secondComment<=15){
			if (this.secondComment==15 && !isEmpty(this.editCommentData)){
			  this.form.controls['comment'].setValue(null);
			  this.addCategoryList = [];
			  this.editCommentData = null;
			}
			return false;
		}
		else {
			return true;
		}
	  }

	getComments (page=1,caseId?:number) {
		if (caseId){
		this.caseId = caseId;
		}
		let params = {
			per_page:10,
			page:page,
			order_by: 'DESC',
			object_id:this.form.value.object_id
		};
		if (this.caseId){
			params ['case_id'] = this.caseId;
		}
		else {
		 params ['case_id']= this.caseFlowServiceService && this.caseFlowServiceService.case?this.caseFlowServiceService.case.id:null;
		}
		params['users'] =this.searchUsers;
		params['category_slugs'] = this.selectedCategories.map(category=> category.slug);
		this.loadSpin=true;
		this.subscription.push(
			this.requestService.sendRequest(CaseFlowUrlsEnum.caseGetComments, 'post', REQUEST_SERVERS.kios_api_path,params).subscribe(
				(res:any) => {
					this.loadSpin=false;
					this.disabledFilterComment= false;
					this.disalberesetComment = false;
					this.allCommentsInformation = res.result;
					console.log(this.allCommentsInformation,'All Comment Information');
					if (res && res.result && res.result.data && res.result.data.docs && res.result.data.docs.length!=0){
					if (this.presentPage == 1) {
						this.comments = [];
					  }
					  if (this.comments.length ==0 ) {
						this.comments = [...res.result.data.docs].reverse();
					  }
					  else {
						  let commentArray :any[] ;
						  commentArray= [...res.result.data.docs.reverse()];
						this.comments = commentArray.concat(this.comments);
					  }
				}
				else {
					this.comments=[...res.result.data.docs];
				}
					this.allCommentsInformation = res.result;
					this.infiniteScrollDisabled = false;
					if (page==1){
					this.scrollToBottom(50);
					}
				},
				(err) => {
					this.loadSpin=false;
				},
			),
		);
	}

	
	refreshComments() {
		// this.comments=[];
		this.disabledFilterComment = true;
		this.presentPage =1;
		this.getComments();
		
	}

	resetComments(){
		this.disabledFilterComment = true;
		this.presentPage =1;
		this.selectedCategories = [];
		this.searchedUsers = [];
		this.searchUsers = null;
		this.getComments();
	}
	
	resetCatgories() {
		if (this.slug !== ''){
			this.selectedCategories = this.selectedCategories.filter(category => category.slug === this.slug);
		}else{
			this.selectedCategories = [];
		}

		//this.comments=[];
		this.disalberesetComment = true;
		this.presentPage =1;
		// this.form.controls['comment'].setValue('');
		this.searchedUsers = [];
		this.searchUsers = null;
		//this.getComments();
		
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

	deleteComment(comment){
		debugger;
		this.loadSpin= true;
		this.subscription.push(
			this.requestService.sendRequest(GeneralSharedEnum.deleteComment, 'post', REQUEST_SERVERS.kios_api_path,{id:comment.id,
				object_id:this.form.value.object_id
			}).subscribe(
				(res:any) => {
	 				if (res.status  ==200){	
						this.form.controls['comment'].setValue(null);
					//	this.comments=[];
						this.presentPage=1;
					// this.getComments();
					this.toastrService.success("Comment Deleted Successfully", 'success')

					}
				},
				(err) => {
					this.loadSpin= false;
					this.toastrService.error(err.error.message, 'Error')

				},
			),
		);
	}

}
