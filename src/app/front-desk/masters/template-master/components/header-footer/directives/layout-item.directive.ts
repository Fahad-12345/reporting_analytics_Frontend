import { Directive, Input, OnChanges, ViewContainerRef, ComponentFactoryResolver, ComponentRef } from '@angular/core';

import { TextComponent } from '../components/text/text.component';
import { SimpleImageComponent } from '../components/simple-image/simple-image.component';
import { InputComponent } from '../components/input/input.component';
import { IntellisenseComponent } from '../components/intellisense/intellisense.component';
import { LineComponent } from '../components/line/line.component';

const components = {
  text: TextComponent,
  simpleImage: SimpleImageComponent,
  input: InputComponent,
  intellisense: IntellisenseComponent,
  line: LineComponent,
};

@Directive({
  selector: '[appLayoutItem]'
})
export class LayoutItemDirective implements OnChanges {
  @Input() data: any;
  @Input() componentRef: any;
  @Input() object: any;
  component: ComponentRef<any>;

  constructor(
    private container: ViewContainerRef,
    private resolver: ComponentFactoryResolver
  ) { }

  ngOnChanges(): void {

    const component = components[this.componentRef];
    if (component) {
      const factory = this.resolver.resolveComponentFactory<any>(component);
      this.component = this.container.createComponent(factory);
      this.component.instance.item=this.data;
      this.component.instance.object = this.object
    }

  }

}
