export class UserRole {
	constructor(
		public name: string,
		public comment: string,
		public qualifier?:string,
		public id?: number,
		public medical_identifier?: any,
		public created_at?: string,
		public updated_at?: string,
		public has_supervisor?:boolean,
		public can_finalize?:boolean,

	) { }

}
