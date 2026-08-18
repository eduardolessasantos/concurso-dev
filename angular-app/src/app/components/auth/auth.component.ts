import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent implements OnInit {
  public activeTab = signal<'login' | 'register'>('login');
  public selectedRole = signal<'PROFESSOR' | 'STUDENT'>('PROFESSOR');
  public showPassword = signal<boolean>(false);
  
  public email = '';
  public password = '';
  public fullName = '';
  public headline = '';
  public goalExam = '';

  public isLoading = false;
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.resetForm();
  }

  resetForm(): void {
    this.email = '';
    this.password = '';
    this.fullName = '';
    this.headline = '';
    this.goalExam = '';
    this.showPassword.set(false);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  switchTab(tab: 'login' | 'register'): void {
    this.activeTab.set(tab);
    this.resetForm();
  }

  setRole(role: 'PROFESSOR' | 'STUDENT'): void {
    this.selectedRole.set(role);
  }

  toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  onSubmit(): void {
    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isLoading = true;

    if (this.activeTab() === 'login') {
      this.authService.login({ email: this.email, password: this.password }).subscribe({
        next: (res) => {
          this.isLoading = false;
          const role = res.userRole || res.role;
          if (role === 'PROFESSOR') {
            this.router.navigate(['/professor/estudio']);
          } else {
            this.router.navigate(['/meus-estudos']);
          }
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage.set(err.error?.message || 'E-mail ou senha inválidos.');
        }
      });
    } else {
      const payload = {
        email: this.email,
        password: this.password,
        fullName: this.fullName,
        role: this.selectedRole(),
        userRole: this.selectedRole(),
        headline: this.headline,
        goalExam: this.goalExam
      };

      this.authService.register(payload).subscribe({
        next: (res) => {
          this.isLoading = false;
          this.successMessage.set('Conta criada com sucesso! Redirecionando...');
          setTimeout(() => {
            const role = res.userRole || res.role;
            if (role === 'PROFESSOR') {
              this.router.navigate(['/professor/estudio']);
            } else {
              this.router.navigate(['/meus-estudos']);
            }
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage.set(err.error?.message || 'Erro ao criar conta. Verifique os dados inseridos.');
        }
      });
    }
  }
}
