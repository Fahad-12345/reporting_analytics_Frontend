import { Component, Input, OnInit } from '@angular/core';
import { CaseFlowServiceService } from '@appDir/front-desk/fd_shared/services/case-flow-service.service';

@Component({
  selector: 'app-shimmer-loader',
  templateUrl: './shimmer-loader.component.html',
  styleUrls: ['./shimmer-loader.component.scss']
})
export class ShimmerLoaderComponent implements OnInit {
  @Input() loaderSpin: boolean; 
  numbers:any[] = [];
  constructor(public caseFlow: CaseFlowServiceService) { }

  ngOnInit() {
    this.numbers = Array(100).fill(0);
  }

}
