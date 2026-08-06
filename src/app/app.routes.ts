import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent) },
  { path: 'disciplinas', loadComponent: () => import('./components/subjects/subjects.component').then(m => m.SubjectsComponent) },
  { path: 'disciplinas/:subjectId', loadComponent: () => import('./components/subject-detail/subject-detail.component').then(m => m.SubjectDetailComponent) },
  { path: 'disciplinas/:subjectId/questao/:questionNumber', loadComponent: () => import('./components/question-detail/question-detail.component').then(m => m.QuestionDetailComponent) },
  { path: 'cronograma', loadComponent: () => import('./components/schedule/schedule.component').then(m => m.ScheduleComponent) },
  { path: 'simulado', loadComponent: () => import('./components/simulated/simulated.component').then(m => m.SimulatedComponent) },
  { path: 'simulado/resultado/:historyIndex', loadComponent: () => import('./components/simulated-report/simulated-report.component').then(m => m.SimulatedReportComponent) },
  { path: '**', redirectTo: '' }
];
