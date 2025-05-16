import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { finalize } from "rxjs/operators";
import { LoaderService } from "../services/loader.service";

@Injectable()
export class LoaderInterceptor implements HttpInterceptor {

    constructor(public loaderService: LoaderService) { 
	}
    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
		if(!req.params.get('dropDownFilter') && !req.body?.disableLoaderForExports){
			this.loaderService.showLoader();
		   }
		delete req.body?.disableLoaderForExports;
		this.loaderService.increaseRequestSentCountByone();
        return next.handle(req).pipe(
            finalize(() => {
				this.loaderService.decreaseRequestSentCountByone();
				if(this.loaderService.isAllRequestReturned())
				{
					this.loaderService.hideLoader();
				}else {
					setTimeout(() => {
						this.loaderService.hideLoader();
					}, 30000);
				}
			})
        );
    }
}
