import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentManagementService, Enrollment, InviteGenerated } from '../../services/student-management.service';
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

  public selectedCourseId = signal<string>('');
  public enrolledStudents = signal<Enrollment[]>([]);

  // WhatsApp input
  public targetPhone = '';
  public lastInviteGenerated = signal<InviteGenerated | null>(null);

  // States
  public isCopyingLink = false;
  public isSendingWhatsApp = false;
  public isGeneratingQr = false;
  public showQrModal = signal<boolean>(false);
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
  }

  onCourseChange(courseId: string): void {
    this.selectedCourseId.set(courseId);
    this.lastInviteGenerated.set(null);
    this.loadEnrolledStudents();
  }

  getSelectedCourse(): CourseResponseDto | undefined {
    return this.coursesService.myCourses().find(c => c.id === this.selectedCourseId());
  }

  loadEnrolledStudents(): void {
    const courseId = this.selectedCourseId();
    if (!courseId) return;

    this.studentService.getCourseEnrollments(courseId).subscribe({
      next: (res) => this.enrolledStudents.set(res),
      error: () => this.enrolledStudents.set([])
    });
  }

  // 1. Ação Copiar Link
  onCopyLink(): void {
    const courseId = this.selectedCourseId();
    if (!courseId) {
      this.alertMessage.set({ type: 'error', text: 'Selecione um curso primeiro.' });
      return;
    }

    this.isCopyingLink = true;
    this.alertMessage.set(null);

    this.studentService.generateInvite(courseId, 'Link').subscribe({
      next: (invite) => {
        this.isCopyingLink = false;
        this.lastInviteGenerated.set(invite);
        if (navigator.clipboard) {
          navigator.clipboard.writeText(invite.inviteUrl).then(() => {
            this.alertMessage.set({
              type: 'success',
              text: `🔗 Link exclusivo copiado para a área de transferência! Token: ${invite.token} (Válido por 7 dias, até 10 utilizações).`
            });
          });
        }
      },
      error: (err) => {
        this.isCopyingLink = false;
        this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao gerar link de convite.' });
      }
    });
  }

  // 2. Ação Enviar WhatsApp
  onSendWhatsApp(): void {
    const courseId = this.selectedCourseId();
    if (!courseId) {
      this.alertMessage.set({ type: 'error', text: 'Selecione um curso primeiro.' });
      return;
    }

    if (!this.targetPhone || this.targetPhone.trim().length < 10) {
      this.alertMessage.set({ type: 'error', text: 'Informe um número de telefone com DDD (ex: 11987654321).' });
      return;
    }

    this.isSendingWhatsApp = true;
    this.alertMessage.set(null);

    this.studentService.generateInvite(courseId, 'WhatsApp', this.targetPhone.trim()).subscribe({
      next: (invite) => {
        this.isSendingWhatsApp = false;
        this.lastInviteGenerated.set(invite);
        this.alertMessage.set({
          type: 'success',
          text: `📱 Convite enviado com sucesso via WhatsApp Cloud API para ${this.targetPhone}! Token: ${invite.token}`
        });
        this.targetPhone = '';
      },
      error: (err) => {
        this.isSendingWhatsApp = false;
        this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao disparar convite via WhatsApp.' });
      }
    });
  }

  // 3. Ação Gerar QR Code
  onGenerateQr(): void {
    const courseId = this.selectedCourseId();
    if (!courseId) {
      this.alertMessage.set({ type: 'error', text: 'Selecione um curso primeiro.' });
      return;
    }

    this.isGeneratingQr = true;
    this.alertMessage.set(null);

    this.studentService.generateInvite(courseId, 'QrCode').subscribe({
      next: (invite) => {
        this.isGeneratingQr = false;
        this.lastInviteGenerated.set(invite);
        this.showQrModal.set(true);
      },
      error: (err) => {
        this.isGeneratingQr = false;
        this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao gerar QR Code.' });
      }
    });
  }

  closeQrModal(): void {
    this.showQrModal.set(false);
  }

  onRevoke(enrollment: Enrollment): void {
    if (confirm(`Deseja revogar o acesso do aluno ${enrollment.studentEmail || enrollment.studentName}?`)) {
      this.studentService.revokeAccess(enrollment.id).subscribe({
        next: () => {
          this.alertMessage.set({ type: 'success', text: `Acesso revogado com sucesso.` });
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

    const headers = ['"Nome do Aluno"', '"E-mail"', '"Origem da Matrícula"', '"Data"', '"Status"'];
    const rows = students.map(s => [
      `"${s.studentName.replace(/"/g, '""')}"`,
      `"${s.studentEmail}"`,
      `"${s.grantedVia}"`,
      `"${new Date(s.createdAt).toLocaleDateString('pt-BR')}"`,
      `"${s.status}"`
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
