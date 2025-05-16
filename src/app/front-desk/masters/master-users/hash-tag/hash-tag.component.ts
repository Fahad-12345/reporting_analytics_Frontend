import { Component, OnInit } from '@angular/core';
import { NgbModalRef, NgbModal, NgbModalOptions } from '@ng-bootstrap/ng-bootstrap';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UMResponse } from '../models/um.response.model';
import { HttpService } from '@appDir/front-desk/fd_shared/services/http.service';
import { HashTag, HashTagCategory } from './hash-tag.model';
import { ToastrService } from 'ngx-toastr';
import { SelectionModel } from '@angular/cdk/collections';
import { Page } from '@appDir/front-desk/models/page';
import { AclService } from '@appDir/shared/services/acl.service';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { CustomDiallogService } from '@appDir/shared/services/custom-dialog.service';


@Component({
  selector: 'app-hash-tag',
  templateUrl: './hash-tag.component.html',
})
export class HashTagComponent implements OnInit {
  addNewCategoryForm: FormGroup;

  public allCategories: HashTagCategory[] = [];
  public category: HashTagCategory;
  public hashTags: HashTag[];
  public hashTag: HashTag;
  public editAblehashTag: HashTag;
  public totalSelected = 0;

  // Modal
  public submitText: string = 'Save';
  public headerText: string = 'Add hHsh Tag';
  public modalRef: NgbModalRef;

  // Form
  hashTagForm: FormGroup;
  addTagForm: FormGroup;
  totalRows: number;
  isEdit: boolean = false;
  loading: boolean = false;

  // Pagination
  page: Page;

  selection = new SelectionModel<HashTag>(true, []);
  selecting = new SelectionModel<HashTag>(true, []);

  constructor(
    public aclService: AclService,
    private http: HttpService,
    private fb: FormBuilder,
    private modalService: NgbModal,
    private customDiallogService : CustomDiallogService,
    private toastrService: ToastrService,
    private formBuilder: FormBuilder,
    private titleService: Title,
    private _route: ActivatedRoute, ) {
    this.page = new Page();
    this.page.size = 10;
  }

  ngOnInit() {
    this.titleService.setTitle(this._route.snapshot.data['title']);
    this.hashTagForm = this.initializeForm();
    // this.fetchList();
    this.totalSelected = this.selection.selected.length;

    this.addNewCategoryForm = this.formBuilder.group({
      name: ['', Validators.required],
      description: ['', Validators.required]
    });

    this.http.get<UMResponse<HashTagCategory[]>>('all-tags-category').subscribe(res => {
      const { data } = res;

      this.allCategories = data;
    }, err => {
    })

    this.addTagForm = this.formBuilder.group({
      tag: ['', Validators.required],
      catId: ['', Validators.required],
      description: ['', Validators.required]
    });
  }

  fetchList() {
    this.http.get<UMResponse<HashTag[]>>('all_hash_tag')
      .subscribe(resp => {
        const { data } = resp;

        this.hashTags = data;
      });

  }

  onSubmit() {
    this.loading = true;
    this.hashTag = this.hashTagForm.value;

    let url: string = 'add_hashTag';
    if (this.isEdit) {
      url = 'update_hashTag';
      this.hashTag.hash_tag_id = this.editAblehashTag.hash_tag_id;
    }


    this.httpVerb(url, this.hashTag, this.isEdit)
      .subscribe(res => {
        const { message, data: hashTag } = res;


        this.hashTags = this.isEdit
          ? this.remove(this.hashTags, this.editAblehashTag.hash_tag_id, 'hash_tag_id', hashTag)
          : [hashTag, ...this.hashTags].slice();


        this.hashTagForm.reset();
        this.modalRef.close();
        this.loading = false;

        this.toastrService.success(message, 'Success');


      },
        error => this.toastrService.error(error.message || 'Something went wrong.', 'Error'));
  }

  private remove<T>(arr: T[], id: number, key: string, item: T): T[] {

    const _arr = [...arr];

    const index = arr.findIndex(row => row[`${key}`] === id);
    _arr.splice(index, 1, item);

    return _arr;
  }

  private initializeForm() {
    return this.fb.group({
      hash_tag_name: ['', [Validators.required]],
      description: [''],
    });
  }

  setForm(hashTag: HashTag) {
    this.hashTagForm.patchValue({
      'hash_tag_name': hashTag.hash_tag_name,
      'description': hashTag.description,
    });
  }

  resetForm() {
    this.hashTagForm.reset();
  }

  openModal(modal) {
    const ngbModalOptions: NgbModalOptions = {
      backdrop: 'static',
      keyboard: false, windowClass: 'modal_extraDOc'
    };

    this.modalRef = this.modalService.open(modal, ngbModalOptions);
  }

  isAllSelected() {
    this.totalRows = this.hashTags.length;

    return this.selection.selected.length === this.totalRows;
  }

  masterToggle() {
    this.isAllSelected()
      ? this.selection.clear()
      : this.hashTags
        .slice(0, this.totalRows).forEach(row => this.selection.select(row));
  }

  edit(modal, hashTag: HashTag) {
    this.editAblehashTag = hashTag;

    this.isEdit = true;
    this.submitText = 'Update';
    this.headerText = 'Edit hashTag';
    this.setForm(this.editAblehashTag);

    this.openModal(modal);
  }

  save(modal) {

    this.isEdit = false;
    this.submitText = 'Save';
    this.headerText = 'Add hashTag';
    this.resetForm();

    this.openModal(modal);
  }

  deleteOne(id) {
    this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
			  this.http
            .delete<UMResponse<HashTag>>(`delete_hash_tag/${id}`)
            .subscribe(resp => {
              const { message } = resp;
              this.hashTags = this.hashTags.filter(hashTag => hashTag.hash_tag_id !== id);
              this.toastrService.success(message, 'Success');
            }, err => {
              this.toastrService.error(err.message, 'Error');
            });
          }
		})
		.catch();
  }

  bulkDelete() {
    const selected = this.selection.selected;
    const ids = selected.map(row => row.hash_tag_id);
    this.customDiallogService.confirm('Delete Confirmation?', `Are you sure you want to delete?`,'Yes','No')
		.then((confirmed) => {
			
			if (confirmed){
        this.http
        .deleteMultiple(`delete_multiple_hash_tag`, ids)
        .subscribe(resp => {

          this.hashTags = this.removeMultipleFromArr(this.hashTags, ids, 'hash_tag_id');
          this.selection.clear();
          this.toastrService.success('Successfully deleted.', 'Success');

        }, err => {
          this.toastrService.error(err.message, 'Error');
        });
				
			}
		})
		.catch();
  }

  private removeMultipleFromArr<T>(data: T[], toBeDeleted: number[], key): T[] {
    return data.filter(row =>
      row[`${key}`] !== toBeDeleted.find(element => row[`${key}`] === element));
  }

  private httpVerb(url, data, isEdit = false) {
    return isEdit
      ? this.http.put<UMResponse<HashTag>>(url, data)
      : this.http.post<UMResponse<HashTag>>(url, data);
  }

  PageLimit($num) {
    this.page.size = Number($num);
  }
  stringfy(obj) {
    return JSON.stringify(obj);
  }

  newCategoryFormSubmit() {
    this.loading = true;
    if (this.addNewCategoryForm.invalid) {

      return;
    }

    this.http.post<UMResponse<HashTagCategory>>('add-tags-category', this.addNewCategoryForm.value).subscribe(res => {
    }, err => {
    });
    this.addNewCategoryForm.reset();
    this.modalRef.close();
    this.loading = false;

    this.toastrService.success('Success');

  }
  addTagFormSubmit() {
    this.loading = true;

    if (this.addTagForm.invalid) {
      return;
    }

    this.http.post<UMResponse<HashTag>>('add-tags-by-catId', this.addTagForm.value).subscribe(res => {
    }, err => {
    });
    this.addTagForm.reset();
    this.modalRef.close();
    this.loading = false;

    this.toastrService.success('Success');
  }

}
