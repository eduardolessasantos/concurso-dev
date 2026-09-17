import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CoursesService } from '../../services/courses.service';
import { CourseStudyPlan, TopicHierarchyDto } from '../../models/course.model';

@Component({
  selector: 'app-study-wrapper',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './study-wrapper.component.html',
  styleUrls: ['./study-wrapper.component.scss']
})
export class StudyWrapperComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private coursesService = inject(CoursesService);

  public courseId = signal<string>('00000000-0000-0000-0000-000000000001');
  public course = signal<CourseStudyPlan | null>(null);
  public activeSubTab = signal<'overview' | 'subjects' | 'schedule' | 'simulated'>('overview');
  public isLoading = signal<boolean>(true);
  public selectedTopic = signal<TopicHierarchyDto | null>(null);
  public expandedSubjects = signal<{ [key: string]: boolean }>({});

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      if (params['courseId']) {
        this.courseId.set(params['courseId']);
        this.loadCourse(params['courseId']);
      }
    });
  }

  loadCourse(id: string): void {
    this.isLoading.set(true);
    this.coursesService.getCourseById(id).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.course.set(data);
        if (data && data.subjects) {
          const initialExpanded: { [key: string]: boolean } = {};
          data.subjects.forEach(s => initialExpanded[s.id] = true);
          this.expandedSubjects.set(initialExpanded);
        }
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  setTab(tab: 'overview' | 'subjects' | 'schedule' | 'simulated'): void {
    this.activeSubTab.set(tab);
  }

  toggleSubject(subjectId: string): void {
    this.expandedSubjects.update(prev => ({
      ...prev,
      [subjectId]: !prev[subjectId]
    }));
  }

  selectTopic(topic: TopicHierarchyDto): void {
    this.selectedTopic.set(topic);
  }

  get subjectsCount(): number {
    return this.course()?.subjects?.length || 0;
  }

  get topicsCount(): number {
    const subjects = this.course()?.subjects || [];
    return subjects.reduce((acc, s) => acc + (s.topics?.length || 0), 0);
  }

  get flashcardsCount(): number {
    const subjects = this.course()?.subjects || [];
    let count = 0;
    for (const s of subjects) {
      for (const t of (s.topics || [])) {
        count += (t.flashcards?.length || 0);
      }
    }
    return count > 0 ? count : (this.topicsCount * 4);
  }

  get questionsCount(): number {
    const subjects = this.course()?.subjects || [];
    let count = 0;
    for (const s of subjects) {
      for (const t of (s.topics || [])) {
        count += (t.questions?.length || 0);
      }
    }
    return count > 0 ? count : (this.topicsCount * 3);
  }
}

