import {
	Directive,
	Input,
	OnChanges,
	ViewContainerRef,
	ComponentFactoryResolver,
	ComponentRef,
} from '@angular/core';

import { TextComponent } from '../components/text/text.component';
import { LineComponent } from '../components/line/line.component';
import { CheckboxComponent } from '../components/checkbox/checkbox.component';
import { InputComponent } from '../components/input/input.component';
import { RadioComponent } from '../components/radio/radio.component';
import { SwitchComponent } from '../components/switch/switch.component';
import { DropdownComponent } from '../components/dropdown/dropdown.component';
import { IntensityComponent } from '../components/intensity/intensity.component';
import { IncrementComponent } from '../components/increment/increment.component';
import { ImageComponent } from '../components/image/image.component';
import { SimpleImageComponent } from '../components/simple-image/simple-image.component';
import { SignatureComponent } from '../components/signature/signature.component';
import { DrawingComponent } from '../components/drawing/drawing.component';
import { IntellisenseComponent } from '../components/intellisense/intellisense.component';
import { CalculationComponent } from '../components/calculation/calculation.component';
import { TableDropdownComponent } from '../components/tableDropdown/tableDropdown.component';
import { UI_COMPONENT_TYPES } from '../common/constants';

const components = {
	[UI_COMPONENT_TYPES.CALCULATION]: CalculationComponent,
	[UI_COMPONENT_TYPES.CHECKBOX]: CheckboxComponent,
	[UI_COMPONENT_TYPES.DRAWING]: DrawingComponent,
	[UI_COMPONENT_TYPES.DROPDOWN]: DropdownComponent,
	[UI_COMPONENT_TYPES.IMAGE_LABEL]: ImageComponent,
	[UI_COMPONENT_TYPES.INCREMENT]: IncrementComponent,
	[UI_COMPONENT_TYPES.INPUT]: InputComponent,
	[UI_COMPONENT_TYPES.INTELLISENSE]: IntellisenseComponent,
	[UI_COMPONENT_TYPES.INTENSITY]: IntensityComponent,
	[UI_COMPONENT_TYPES.LINE]: LineComponent,
	[UI_COMPONENT_TYPES.RADIO]: RadioComponent,
	[UI_COMPONENT_TYPES.SIGNATURE]: SignatureComponent,
	[UI_COMPONENT_TYPES.SIMPLE_IMAGE]: SimpleImageComponent,
	[UI_COMPONENT_TYPES.SWITCH]: SwitchComponent,
	[UI_COMPONENT_TYPES.TABLE_DROPDOWN]: TableDropdownComponent,
	[UI_COMPONENT_TYPES.TEXT]: TextComponent
}

@Directive({
	selector: '[appLayoutItem]',
})
export class LayoutItemDirective implements OnChanges {
	@Input() data: any;
	@Input() componentRef: any;
	@Input() object: any;
	component: ComponentRef<any>;

	constructor(private container: ViewContainerRef, private resolver: ComponentFactoryResolver) {}

	ngOnChanges(): void {
		const component = components[this.componentRef];
		if (component) {
			const factory = this.resolver.resolveComponentFactory<any>(component);
			this.component = this.container.createComponent(factory);

			this.component.instance.item = this.data;

			this.component.instance.object = this.object;
		}
	}
}
