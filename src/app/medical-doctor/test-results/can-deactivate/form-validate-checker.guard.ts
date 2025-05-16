import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanDeactivate, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {ComponentFormValidateChecker} from './component-form-validate-checker';

@Injectable()
export class FormValidateCheckerGuard implements CanDeactivate<ComponentFormValidateChecker> {
    canDeactivate(component: ComponentFormValidateChecker): boolean {
        if (!component.canDeactivate()) {
            if (confirm('You have unsaved changes! If you leave, your changes will be lost.')) {
                return true;
            } else {
                return false;
            }
        }
        return true;
    }
}
