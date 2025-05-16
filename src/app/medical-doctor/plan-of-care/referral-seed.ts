import {
	SeededGoal,
	SeededModality,
	SeededTharapy,
	SeededExcercise,
	SeededReferral,
} from '../md-shared/seededInfo';

export class ReferralSeed {
	private _goals: SeededGoal[];
	private _modalities: SeededModality[];
	private _manual_therapies: SeededTharapy[];
	private _excercises: SeededExcercise[];
	private _referrals: SeededReferral[];

	constructor(seeds) {
		this.setSeeds(seeds);
	}

	public setSeeds(seeds) {
		this.goals = seeds.goals;
		this.modalities = seeds.modalities;
		this.manual_therapies = seeds.manual_therapies;
		this.excercises = seeds.excercises;
		this.referrals = seeds.referrals;
	}

	public get goals(): SeededGoal[] {
		return this._goals;
	}

	public set goals(goals: SeededGoal[]) {
		this._goals = goals;
	}

	public get modalities(): SeededModality[] {
		return this._modalities;
	}

	public set modalities(modalities: SeededModality[]) {
		this._modalities = modalities;
	}

	public get manual_therapies(): SeededTharapy[] {
		return this._manual_therapies;
	}

	public set manual_therapies(manual_therapies: SeededTharapy[]) {
		this._manual_therapies = manual_therapies;
	}

	public get excercises(): SeededExcercise[] {
		return this._excercises;
	}

	public set excercises(excercises: SeededExcercise[]) {
		this._excercises = excercises;
	}

	public get referrals(): SeededReferral[] {
		return this._referrals;
	}

	public set referrals(referrals: SeededReferral[]) {
		this._referrals = referrals;
	}
}
