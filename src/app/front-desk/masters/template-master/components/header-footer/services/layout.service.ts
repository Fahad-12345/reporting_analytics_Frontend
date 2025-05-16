import { SubjectService } from "./subject.service";
import { Inject, Injectable } from "@angular/core";

import { DOCUMENT } from "@angular/common";

export interface IComponent {
  id: string;
  componentRef: string;
}

@Injectable({
  providedIn: 'root'
})

export class LayoutService {
	constructor(@Inject(DOCUMENT) private doc: any, public subjectService: SubjectService) {}
  public sectionsSearch: any;
  public headers: any;
  public pageSize: any;
  public tempStringValue: any;
  public headerFooterModal: any;
  public collapseSectionIndex = false;
	backupQueue: any = [];
	backupId:number = 1;
	backupIndex:number = -2;
  public section: any = {
    section_id: 0,
    uiCompIds: 0,
    boundSectionStatement: name,
    section_title: name,
    is_header: 1,
    default_columns: 1,
    isSelected: true,
    defaultColumn: false,
    mapper: [1],
    options: {},
    dashboard: [],
	  headerMarginLeft:  0,
	  headerMarginRight:  0
  };
  refreshObject(object) {
    // object = {...object};
    this.subjectService.objectRefreshItem(object);
  }
  stripEditorHTML(st) {
    for (let q = 1; q < 8; q++) {
      st = st.replaceAll('div style="font-size:' + q + '">', "");
    }
    st = st.replaceAll(/<\/?[biu]>/g, "");
    st = st.replaceAll('<div style="text-align: left;">', "<div>");
    st = st.replaceAll("</div>", "");
    st = st.replaceAll('<div style="text-align: right;">', '<div style="text-align: left;">');
    st = st.replaceAll('<div style="text-align: center;">', '<div style="text-align: left;">');
    st = st.replaceAll('<div style="text-align: justify;">', '<div style="text-align: left;">');
    st = st.replaceAll("<div>", '<div style="text-align: left;">');
    return st;
  }
  stripHtml(html) {
		let tmp = document.createElement("DIV");
		tmp.innerHTML = html;
		return tmp.textContent || tmp.innerText || "";
	}
  applyEditor(object, st) {
    if ("textLabel" in object) {
      object.textLabel = this.stripHtml(object.instanceLabel);
    }
    st = this.stripEditorHTML(st);
    if (object.fontSize) {
      if (object.fontSize) {
        st = '<div style="font-size:' + object.fontSize + '">' + st + "</div>";
      }
    }
    if (object.isBold) {
      st = "<b>" + st + "</b>";
    }
    if (object.isItalic) {
      st = "<i>" + st + "</i>";
    }
    if (object.isUnderLine) {
      st = "<u>" + st + "</u>";
    }
    if (object.isAlign == 1) {
      st = '<div style="text-align: left;">' + st + "</div>";
      // st = this.sanitizer.bypassSecurityTrustHtml(st);
    }
    if (object.isAlign == 2) {
      st = '<div style="text-align: center;">' + st + "</div>";
      // st = this.sanitizer.bypassSecurityTrustHtml(st);
    }
    if (object.isAlign == 3) {
      st = '<div style="text-align: right;">' + st + "</div>";
      // st = this.sanitizer.bypassSecurityTrustHtml(st);
    }
    if (object.isJustify) {
      st = '<div style="text-align: justify;">' + st + "</div>";
      // st = this.sanitizer.bypassSecurityTrustHtml(st);
    }
    return st;
  }
  lastK: any = 0;
  editTemplate = false;
  templateSections: any[];
  imageModal: any;
  imageObj: any;
  public NormalSectionTypeId: any = 1;
  public tableSectionTypeId: any = 2;
  public tableSubSectionTypeId: any = 3;
  componentsService: any;
  openTemplate: boolean;
}
