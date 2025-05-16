import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class StateService {
  constructor(private state:any) {}
    setState(state: any) {
      this.state = state;
    }
    getState() {
      return this.state;
    }
  }

