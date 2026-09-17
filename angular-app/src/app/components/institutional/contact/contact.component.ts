import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent {
  public name = '';
  public email = '';
  public subject = 'Dúvida Pedagógica / Curso';
  public message = '';

  public isSending = signal<boolean>(false);
  public isSent = signal<boolean>(false);

  public onSubmit(): void {
    if (!this.name.trim() || !this.email.trim() || !this.message.trim()) return;

    this.isSending.set(true);
    // Simula envio de contato seguro
    setTimeout(() => {
      this.isSending.set(false);
      this.isSent.set(true);
      this.name = '';
      this.email = '';
      this.message = '';
    }, 1000);
  }
}
