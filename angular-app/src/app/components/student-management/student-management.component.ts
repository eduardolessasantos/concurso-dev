import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentManagementService, Enrollment, AccessRequest } from '../../services/student-management.service';
import { CoursesService } from '../../services/courses.service';
import { CourseResponseDto } from '../../models/course.model';

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.scss']
})
export class StudentManagementComponent implements OnInit {
  public studentService = inject(StudentManagementService);
  public coursesService = inject(CoursesService);

  public activeTab = signal<'invite' | 'requests' | 'enrolled'>('invite');

  public studentEmail = '';
  public welcomeMessage = '';
  public selectedCourseId = signal<string>('');

  public pendingRequests = signal<AccessRequest[]>([]);
  public enrolledStudents = signal<Enrollment[]>([]);

  public isLoading = false;
  public isCopied = signal<boolean>(false);
  public alertMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  ngOnInit(): void {
    this.loadCoursesAndData();
  }

  loadCoursesAndData(): void {
    this.coursesService.getMyCourses().subscribe({
      next: (courses) => {
        if (courses && courses.length > 0) {
          if (!this.selectedCourseId()) {
            this.selectedCourseId.set(courses[0].id);
          }
          this.loadEnrolledStudents();
        }
      }
    });
    this.loadPendingRequests();
  }

  onCourseChange(courseId: string): void {
    this.selectedCourseId.set(courseId);
    this.loadEnrolledStudents();
  }

  getSelectedCourse(): CourseResponseDto | undefined {
    return this.coursesService.myCourses().find(c => c.id === this.selectedCourseId());
  }

  switchTab(tab: 'invite' | 'requests' | 'enrolled'): void {
    this.activeTab.set(tab);
    this.alertMessage.set(null);
  }

  onSendInvite(): void {
    if (!this.selectedCourseId()) {
      this.alertMessage.set({ type: 'error', text: 'Selecione um estudo antes de enviar o convite.' });
      return;
    }

    if (!this.studentEmail.trim()) {
      this.alertMessage.set({ type: 'error', text: 'Por favor, informe o e-mail do aluno.' });
      return;
    }

    this.isLoading = true;
    this.alertMessage.set(null);

    const course = this.getSelectedCourse();
    const courseTitle = course ? course.title : 'Estudo Exclusivo';

    this.studentService.inviteByEmail(this.selectedCourseId(), this.studentEmail, this.welcomeMessage).subscribe({
      next: () => {
        this.isLoading = false;
        this.alertMessage.set({ 
          type: 'success', 
          text: `✨ Acesso concedido com sucesso para ${this.studentEmail} no estudo "${courseTitle}"!` 
        });
        this.studentEmail = '';
        this.welcomeMessage = '';
        this.loadEnrolledStudents();
      },
      error: (err) => {
        this.isLoading = false;
        this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao enviar convite por e-mail.' });
      }
    });
  }

  getShareableLink(): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const courseId = this.selectedCourseId();
    const course = this.getSelectedCourse();
    const title = course ? encodeURIComponent(course.title) : '';
    const emailParam = this.studentEmail.trim() ? `&email=${encodeURIComponent(this.studentEmail.trim())}` : '';
    
    return `${origin}/login?returnUrl=${encodeURIComponent('/estudo/' + courseId)}${emailParam}&courseTitle=${title}`;
  }

  copyShareableLink(): void {
    const link = this.getShareableLink();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        this.isCopied.set(true);
        this.alertMessage.set({ 
          type: 'success', 
          text: '🔗 Link de acesso direto copiado para a área de transferência! Envie pelo WhatsApp ou mensagem.' 
        });
        setTimeout(() => this.isCopied.set(false), 4000);
      });
    }
  }

  loadPendingRequests(): void {
    this.studentService.getPendingAccessRequests().subscribe({
      next: (res) => this.pendingRequests.set(res),
      error: () => {}
    });
  }

  loadEnrolledStudents(): void {
    const courseId = this.selectedCourseId();
    if (!courseId) return;

    this.studentService.getCourseEnrollments(courseId).subscribe({
      next: (res) => this.enrolledStudents.set(res),
      error: () => {
        this.enrolledStudents.set([]);
      }
    });
  }

  onApprove(request: AccessRequest): void {
    this.studentService.approveAccessRequest(request.id).subscribe({
      next: () => {
        this.alertMessage.set({ type: 'success', text: `Acesso aprovado para ${request.studentEmail}!` });
        this.loadPendingRequests();
        this.loadEnrolledStudents();
      },
      error: (err) => {
        this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao aprovar solicitação.' });
      }
    });
  }

  onReject(request: AccessRequest): void {
    this.studentService.rejectAccessRequest(request.id).subscribe({
      next: () => {
        this.alertMessage.set({ type: 'success', text: `Solicitação de ${request.studentEmail} rejeitada.` });
        this.loadPendingRequests();
      },
      error: (err) => {
        this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao rejeitar solicitação.' });
      }
    });
  }

  onRevoke(enrollment: Enrollment): void {
    if (confirm(`Deseja revogar o acesso do aluno ${enrollment.studentEmail}?`)) {
      this.studentService.revokeAccess(enrollment.id).subscribe({
        next: () => {
          this.alertMessage.set({ type: 'success', text: `Acesso do aluno ${enrollment.studentEmail} revogado.` });
          this.loadEnrolledStudents();
        },
        error: (err) => {
          this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao revogar acesso.' });
        }
      });
    }
  }

  exportToCsv(): void {
    const students = this.enrolledStudents();
    if (students.length === 0) {
      alert('Não há alunos matriculados neste estudo para exportação.');
      return;
    }

    const course = this.getSelectedCourse();
    const courseTitle = course ? course.title.replace(/[\",]/g, '') : 'Estudo';

    const headers = ['"Nome do Aluno"', '"E-mail"', '"Origem da Concessão"', '"Data da Matrícula"', '"Status"', '"Estudo"'];
    const rows = students.map(s => [
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.studentEmail}"`,
      `"${s.grantedVia === 'EMAIL_INVITE' ? 'Convite por E-mail' : 'Aprovado na Vitrine'}"`,
      `"${new Date(s.createdAt).toLocaleDateString('pt-BR')}"`,
      `"${s.status === 'ACTIVE' ? 'Ativo' : s.status}"`,
      `"${courseTitle}"`
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `alunos_${courseTitle.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

