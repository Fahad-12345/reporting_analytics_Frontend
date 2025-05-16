
import {
	Component
} from '@angular/core';
import { PomEnum } from '@appDir/pom/pom.enum';

@Component({
	selector: 'app-pom-component',
	templateUrl: './pom-component.html',
	styleUrls: ['./pom.component.scss']
})
export class PomComponent  {
	typeID = PomEnum;



}
