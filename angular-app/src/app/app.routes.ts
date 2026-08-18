import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./components/explore/explore.component').then(m => m.ExploreComponent) },
  { path: 'explorar', loadComponent: () => import('./components/explore/explore.component').then(m => m.ExploreComponent) },
  { path: 'estudo/:courseId', loadComponent: () => import('./components/study-wrapper/study-wrapper.component').then(m => m.StudyWrapperComponent), canActivate: [authGuard] },
  { path: 'p/:slug', loadComponent: () => import('./components/professor-showcase/professor-showcase.component').then(m => m.ProfessorShowcaseComponent) },
  { path: 'checkout/:courseId', loadComponent: () => import('./components/checkout/checkout.component').then(m => m.CheckoutComponent) },
  { path: 'login', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'cadastro', loadComponent: () => import('./components/auth/auth.component').then(m => m.AuthComponent) },
  { path: 'professor/estudio', loadComponent: () => import('./components/professor-studio/professor-studio.component').then(m => m.ProfessorStudioComponent), canActivate: [authGuard] },
  { path: 'professor/alunos', loadComponent: () => import('./components/student-management/student-management.component').then(m => m.StudentManagementComponent), canActivate: [authGuard] },
  { path: 'professor/financeiro', loadComponent: () => import('./components/financial-dashboard/financial-dashboard.component').then(m => m.FinancialDashboardComponent), canActivate: [authGuard] },
  { path: 'meus-estudos', loadComponent: () => import('./components/my-studies/my-studies.component').then(m => m.MyStudiesComponent), canActivate: [authGuard] },
  { path: 'disciplinas', loadComponent: () => import('./components/subjects/subjects.component').then(m => m.SubjectsComponent), canActivate: [authGuard] },
  { path: 'disciplinas/:subjectId', loadComponent: () => import('./components/subject-detail/subject-detail.component').then(m => m.SubjectDetailComponent), canActivate: [authGuard] },
  { path: 'disciplinas/:subjectId/questao/:questionNumber', loadComponent: () => import('./components/question-detail/question-detail.component').then(m => m.QuestionDetailComponent), canActivate: [authGuard] },
  { path: 'cronograma', loadComponent: () => import('./components/schedule/schedule.component').then(m => m.ScheduleComponent), canActivate: [authGuard] },
  { path: 'simulado', loadComponent: () => import('./components/simulated/simulated.component').then(m => m.SimulatedComponent), canActivate: [authGuard] },
  { path: 'simulado/resultado/:historyIndex', loadComponent: () => import('./components/simulated-report/simulated-report.component').then(m => m.SimulatedReportComponent), canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];

