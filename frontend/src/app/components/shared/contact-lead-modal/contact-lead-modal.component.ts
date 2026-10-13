import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PublicShowcaseService, CreateShowcaseLead, ShowcaseLeadResponse } from '../../../services/public-showcase.service';

@Component({
  selector: 'app-contact-lead-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact-lead-modal.component.html',
  styleUrls: ['./contact-lead-modal.component.scss']
})
export class ContactLeadModalComponent {
  @Input() isOpen = false;
  @Input() professorId = '';
  @Input() professorName = '';
  @Input() offeringId: string | undefined;
  @Input() offeringTitle: string | undefined;

  @Output() close = new EventEmitter<void>();
  @Output() leadCreated = new EventEmitter<ShowcaseLeadResponse>();

  public name = signal<string>('');
  public email = signal<string>('');
  public phone = signal<string>('');
  public message = signal<string>('');
  public termsAccepted = signal<boolean>(true);

  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public isSuccess = signal<boolean>(false);

  constructor(private showcaseService: PublicShowcaseService) {}

  formatPhone(value: string): string {
    const numbers = value.replace(/\D/g, '').slice(0, 11);
    if (numbers.length <= 2) return numbers;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 10) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  onPhoneChange(val: string): void {
    this.phone.set(this.formatPhone(val));
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    const nameVal = this.name().trim();
    const emailVal = this.email().trim();

    if (!nameVal || nameVal.length < 2) {
      this.errorMessage.set('Por favor, informe seu nome completo.');
      return;
    }

    if (!emailVal || !emailVal.includes('@') || !emailVal.includes('.')) {
      this.errorMessage.set('Por favor, informe um endereço de e-mail válido.');
      return;
    }

    if (!this.termsAccepted()) {
      this.errorMessage.set('É obrigatório concordar com o envio dos dados de contato (LGPD).');
      return;
    }

    this.isSubmitting.set(true);

    const payload: CreateShowcaseLead = {
      professorId: this.professorId,
      contentOfferingId: this.offeringId || undefined,
      name: nameVal,
      email: emailVal,
      phone: this.phone().trim() || undefined,
      message: this.message().trim() || undefined,
      termsAccepted: this.termsAccepted()
    };

    this.showcaseService.sendLead(payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.isSuccess.set(true);
        this.leadCreated.emit(res);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'Falha ao enviar mensagem. Tente novamente ou use o WhatsApp.');
      }
    });
  }

  resetForm(): void {
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.message.set('');
    this.termsAccepted.set(true);
    this.errorMessage.set(null);
    this.isSuccess.set(false);
  }

  onModalClose(): void {
    this.resetForm();
    this.close.emit();
  }
}
