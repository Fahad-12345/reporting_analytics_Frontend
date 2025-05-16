import { Router, ActivatedRoute } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, EventEmitter, OnInit, Output, OnDestroy } from '@angular/core';
import { OrderEnum } from '@appDir/shared/CustomUrlBuilder/CustomUrlBuilder.class';
import { Subscription } from 'rxjs';
import { unSubAllPrevious } from '@appDir/medical-doctor/referal-forms/shared/utils/helpers';
import { checkReactiveFormIsEmpty, isEmptyObject, isObjectEmpty } from '@appDir/shared/utils/utils.helpers';
import { ReactionService } from '../../reaction.service';
import { Location } from '@angular/common';
@Component({
	selector: 'app-reactions-filter',
	templateUrl: './reactions-filter.component.html',
	styleUrls: ['./reactions-filter.component.scss']
})
export class ReactionsFilterComponent implements OnInit, OnDestroy {
	@Output() onFilterReactionList = new EventEmitter<any>();
	subscription: Subscription[] = [];
	isCollapsed = false;
	reactionDetailForm: FormGroup;
	loadSpin = false;
	constructor(private fb: FormBuilder, private reactionService: ReactionService, private location: Location, private router: Router, private _route: ActivatedRoute) {
	}

	ngOnInit() {
		this.getQueryParams();
	}
	getQueryParams() {
		this.subscription.push(
			this._route.queryParams.subscribe((params) => {
				this.reactionFilterFormInit(); // INIT FORM
				this.setQueryParams(params);
			}),
		);
	}
	setQueryParams(queryParams) {
		this.reactionDetailForm.patchValue(queryParams);
		if (!isEmptyObject(queryParams)) {
			this.filterReaction(queryParams);
			this.reactionService.addUrlQueryParams(queryParams);
		}
	}
	// INITITALIZE PROOFING LICENSE FILTER FORM
	reactionFilterFormInit() {
		this.reactionDetailForm = this.fb.group({
			snomed_concept_id: [''],
			snomed_term_desc_id: [''],
			term_type_desc: [''],
			concept_type: [''],
			value_set_type_description: [''],
			hl7_object_identifier: [''],
			hl7_object_identifier_type: [''],
		})
	}

	// FILTERED REACTION
	filterReaction(params?) {
		const filters = checkReactiveFormIsEmpty(this.reactionDetailForm);
		const queryParams = {
			filter: !isObjectEmpty(filters),
			page: params.page ? params.page : 1,
			per_page: params.per_page ? params.per_page : 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.reactionService.addUrlQueryParams({ ...queryParams, ...filters });
		this.get_filtered_data({ ...queryParams, ...filters });
	}
	
	// GET FILTERED DATA
	get_filtered_data(queryParams) {
		this.loadSpin = true;
		this.subscription.push(
			this.reactionService.getReactionists(queryParams).subscribe((reactionList: any) => {
				if (reactionList.status) {
					this.loadSpin = false;
					reactionList['filterValues'] = this.reactionDetailForm.value
					this.onFilterReactionList.emit(reactionList);
				}
			},
				(error) => {
					this.loadSpin = false;
				})
		);
	}
	// RESET REACTION LIST ON REACTION LIST COMPONENT
	resetReactionList() {
		this.reactionFilterFormInit();
		this.reactionDetailForm.markAsUntouched();
		const queryParams = {
			page: 1,
			per_page: 10,
			order: OrderEnum.DEC,
			pagination: true
		}
		this.reactionService.addUrlQueryParams(queryParams);
		this.get_filtered_data(queryParams);
	}
	// PROOFING LICENSE RESET BUTTON DISALBED OR ENABLED
	reactionFilterResetDisabledCheck() {
		if (isEmptyObject(this.reactionDetailForm.value)) {
			return true;
		}
		return false;
	}
	ngOnDestroy() {
		unSubAllPrevious(this.subscription);
	}
}
