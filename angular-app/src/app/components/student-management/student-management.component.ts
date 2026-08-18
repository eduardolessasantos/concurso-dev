import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { StudentManagementService, Enrollment, AccessRequest } from '../../services/student-management.service';

@Component({
  selector: 'app-student-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './student-management.component.html',
  styleUrls: ['./student-management.component.scss']
})
export class StudentManagementComponent implements OnInit {
  public activeTab = signal<'invite' | 'requests' | 'enrolled'>('invite');

  public studentEmail = '';
  public welcomeMessage = '';
  public selectedCourseId = '00000000-0000-0000-0000-000000000000';

  public pendingRequests = signal<AccessRequest[]>([]);
  public enrolledStudents = signal<Enrollment[]>([]);

  public isLoading = false;
  public alertMessage = signal<{ type: 'success' | 'error'; text: string } | null>(null);

  constructor(private studentService: StudentManagementService) {}

  ngOnInit(): void {
    this.loadPendingRequests();
    this.loadEnrolledStudents();
  }

  switchTab(tab: 'invite' | 'requests' | 'enrolled'): void {
    this.activeTab.set(tab);
    this.alertMessage.set(null);
  }

  onSendInvite(): void {
    if (!this.studentEmail.trim()) {
      this.alertMessage.set({ type: 'error', text: 'Por favor, informe o e-mail do aluno.' });
      return;
    }

    this.isLoading = true;
    this.alertMessage.set(null);

    this.studentService.inviteByEmail(this.selectedCourseId, this.studentEmail, this.welcomeMessage).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.alertMessage.set({ type: 'success', text: `✨ Convite enviado com sucesso para ${this.studentEmail}!` });
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

  loadPendingRequests(): void {
    this.studentService.getPendingAccessRequests().subscribe({
      next: (res) => this.pendingRequests.set(res),
      error: () => {}
    });
  }

  loadEnrolledStudents(): void {
    this.studentService.getCourseEnrollments(this.selectedCourseId).subscribe({
      next: (res) => this.enrolledStudents.set(res),
      error: () => {}
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
          this.alertMessage.set({ type: 'success', text: `Acesso revogado.` });
          this.loadEnrolledStudents();
        },
        error: (err) => {
          this.alertMessage.set({ type: 'error', text: err.error?.message || 'Erro ao revogar acesso.' });
        }
      });
    }
  }
}
