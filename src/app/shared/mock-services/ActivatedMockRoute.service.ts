import { ActivatedRoute, Params } from "@angular/router";
import { Observable } from "rxjs";

export class MockActivatedRoute implements ActivatedRoute{
	public snapshot;
	public url;
	public params;
	public queryParams: Observable<Params>;
	public fragment: Observable<string>;
	public data;
	public outlet;
	public component;
	public paramMap;
	public queryParamMap;
	public routeConfig;
	public root;
	public parent;
	public firstChild;
	public children;
	public pathFromRoot;
	public toString(): string {
	  return '';
	};
  }
