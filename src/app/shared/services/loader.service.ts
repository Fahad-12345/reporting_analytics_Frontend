import { P } from "@angular/cdk/keycodes";
import { Injectable } from "@angular/core";
import { Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})
export class LoaderService {

	
	startLoader$: Subject<boolean> = new Subject();
	startLoader:boolean=false;
	requestSentCount:number=0

	showLoader()
	{
		this.startLoader$.next(true);
		this.startLoader=true
	}
	hideLoader()
	{
		this.startLoader$.next(false);
		this.startLoader=false
	}
	getRequestSentCount():number
	{
		return this.requestSentCount
	}
	increaseRequestSentCountByone()
	{
		 this.requestSentCount+=1;
		
	}
	decreaseRequestSentCountByone()
	{
		if(this.requestSentCount>0)
		{
			this.requestSentCount-=1;
		}
		else
		{
			this.requestSentCount=0;
		}
		
		 
	}
	isAllRequestReturned():boolean
	{
		if(this.getRequestSentCount()===0)
		{
			return true
		}
		else
		{
			return false;
		}
	}  
}
