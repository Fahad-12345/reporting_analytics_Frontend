import { Component, OnInit, Input } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-waiting-list',
  templateUrl: './waiting-list.component.html',
  styleUrls: ['./waiting-list.component.scss']
})
export class WaitingListComponent {
  public content: string;
  constructor(private titleService: Title,
    private _route: ActivatedRoute, ) {
    this.content = "hello world"
    this.titleService.setTitle('Waiting List');
  }
}
