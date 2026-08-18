import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';

@Component({
  selector: 'app-study-wrapper',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './study-wrapper.component.html',
  styleUrls: ['./study-wrapper.component.scss']
})
export class StudyWrapperComponent implements OnInit {
  public courseId = signal<string>('00000000-0000-0000-0000-000000000001');
  public activeSubTab = signal<'overview' | 'subjects' | 'schedule' | 'simulated'>('overview');

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['courseId']) {
        this.courseId.set(params['courseId']);
      }
    });
  }

  setTab(tab: 'overview' | 'subjects' | 'schedule' | 'simulated'): void {
    this.activeSubTab.set(tab);
  }
}
