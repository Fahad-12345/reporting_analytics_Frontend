import { Observable } from "rxjs";

export interface CanDeactivateComponentInterface {
    canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean
}