import { Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AiKeyStorageService, AiProvider, AiConfig, CustomPrompts, DEFAULT_PROMPTS } from '../../services/ai-key-storage.service';

@Component({
  selector: 'app-ai-config-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-card" (click)="$event.stopPropagation()">
        <!-- Header -->
        <div class="modal-header">
          <div class="title-group">
            <span class="icon-badge">⚡</span>
            <div>
              <h3>Configurações de Inteligência Artificial (BYOK)</h3>
              <p class="subtitle">Utilize sua própria chave de API para gerar resumos, flashcards e questões sem custos extras na plataforma.</p>
            </div>
          </div>
          <button class="btn-close" (click)="close()">✕</button>
        </div>

        <!-- Disclaimer Banner -->
        <div class="disclaimer-banner">
          <div class="banner-icon">ℹ️</div>
          <div class="banner-text">
            <strong>Transparência de Custos & Privacidade:</strong>
            <p>Sua chave de API é armazenada <strong>exclusivamente na memória local do seu navegador</strong> (LocalStorage) e nunca é compartilhada ou enviada ao nosso banco de dados. Todo o consumo de tokens é tarifado diretamente pelo provedor escolhido na sua própria conta.</p>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <div class="tab-nav">
          <button [class.active]="activeTab() === 'keys'" (click)="activeTab.set('keys')">🔑 Chave de API & Provedor</button>
          <button [class.active]="activeTab() === 'prompts'" (click)="activeTab.set('prompts')">📝 Prompts Personalizados</button>
        </div>

        <!-- Tab 1: Keys & Provider -->
        <div class="tab-content" *ngIf="activeTab() === 'keys'">
          <div class="form-group">
            <label>Selecione o Provedor de IA:</label>
            <div class="provider-grid">
              <label class="provider-option" [class.selected]="formConfig.provider === 'openai'">
                <input type="radio" name="provider" value="openai" [(ngModel)]="formConfig.provider" (change)="onProviderChange()">
                <div class="provider-info">
                  <strong>OpenAI</strong>
                  <span>GPT-4o, GPT-4o-mini</span>
                </div>
              </label>
              <label class="provider-option" [class.selected]="formConfig.provider === 'gemini'">
                <input type="radio" name="provider" value="gemini" [(ngModel)]="formConfig.provider" (change)="onProviderChange()">
                <div class="provider-info">
                  <strong>Google Gemini</strong>
                  <span>Gemini 1.5 Flash / Pro</span>
                </div>
              </label>
              <label class="provider-option" [class.selected]="formConfig.provider === 'groq'">
                <input type="radio" name="provider" value="groq" [(ngModel)]="formConfig.provider" (change)="onProviderChange()">
                <div class="provider-info">
                  <strong>Groq (Llama 3)</strong>
                  <span>Ultrarrápido / Tier Gratuito</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label>Chave de API (API Key):</label>
            <div class="input-with-action">
              <input 
                [type]="showKey ? 'text' : 'password'" 
                [(ngModel)]="formConfig.apiKey" 
                [placeholder]="getPlaceholder()"
                class="form-control"
              />
              <button type="button" class="btn-toggle-eye" (click)="showKey = !showKey">
                {{ showKey ? '🙈' : '👁️' }}
              </button>
            </div>
            <small class="helper-text" *ngIf="formConfig.provider === 'openai'">Obtenha em: <a href="https://platform.openai.com/api-keys" target="_blank">platform.openai.com/api-keys</a></small>
            <small class="helper-text" *ngIf="formConfig.provider === 'gemini'">Obtenha em: <a href="https://aistudio.google.com/app/apikey" target="_blank">aistudio.google.com</a></small>
            <small class="helper-text" *ngIf="formConfig.provider === 'groq'">Obtenha em: <a href="https://console.groq.com/keys" target="_blank">console.groq.com</a></small>
          </div>

          <div class="form-group">
            <label>Modelo:</label>
            <select [(ngModel)]="formConfig.model" class="form-control">
              <ng-container *ngIf="formConfig.provider === 'openai'">
                <option value="gpt-4o-mini">GPT-4o Mini (Recomendado - Mais rápido e econômico)</option>
                <option value="gpt-4o">GPT-4o (Máxima precisão conceitual)</option>
              </ng-container>
              <ng-container *ngIf="formConfig.provider === 'gemini'">
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Ultrarrápido e econômico)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Contexto profundo)</option>
              </ng-container>
              <ng-container *ngIf="formConfig.provider === 'groq'">
                <option value="llama-3.1-8b-instant">Llama 3.1 8B Instant (Gratuito e veloz)</option>
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B Versatile (Raciocínio avançado)</option>
              </ng-container>
            </select>
          </div>
        </div>

        <!-- Tab 2: Prompts -->
        <div class="tab-content" *ngIf="activeTab() === 'prompts'">
          <div class="form-group">
            <div class="label-row">
              <label>📘 Prompt para Resumo Teórico (Markdown):</label>
            </div>
            <textarea [(ngModel)]="formPrompts.summaryPrompt" rows="3" class="form-control text-sm"></textarea>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label>🗂️ Prompt para Flashcards (Repetição Espaçada):</label>
            </div>
            <textarea [(ngModel)]="formPrompts.flashcardsPrompt" rows="3" class="form-control text-sm"></textarea>
          </div>

          <div class="form-group">
            <div class="label-row">
              <label>❓ Prompt para Questões Inéditas com Gabarito:</label>
            </div>
            <textarea [(ngModel)]="formPrompts.questionsPrompt" rows="3" class="form-control text-sm"></textarea>
          </div>

          <div class="reset-row">
            <button type="button" class="btn-secondary text-sm" (click)="resetPrompts()">🔄 Restaurar Prompts Padrão</button>
          </div>
        </div>

        <!-- Footer Actions -->
        <div class="modal-footer">
          <button class="btn-danger-outline" *ngIf="hasConfiguredKey()" (click)="clearKey()">🗑️ Remover Chave</button>
          <div class="right-actions">
            <button class="btn-cancel" (click)="close()">Cancelar</button>
            <button class="btn-primary" (click)="save()">💾 Salvar Configurações</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(10, 14, 26, 0.82);
      backdrop-filter: blur(8px);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 1.5rem;
    }
    .modal-card {
      background: #111827;
      border: 1px solid #1f2937;
      border-radius: 1.25rem;
      width: 100%;
      max-width: 680px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6);
      overflow: hidden;
    }
    .modal-header {
      padding: 1.5rem 1.75rem;
      border-bottom: 1px solid #1f2937;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .title-group {
      display: flex;
      gap: 1rem;
      align-items: center;
    }
    .icon-badge {
      font-size: 1.75rem;
      background: #1f2937;
      border-radius: 0.75rem;
      padding: 0.5rem;
    }
    .modal-header h3 {
      margin: 0;
      color: #f3f4f6;
      font-size: 1.2rem;
      font-weight: 700;
    }
    .subtitle {
      margin: 0.25rem 0 0;
      color: #9ca3af;
      font-size: 0.85rem;
    }
    .btn-close {
      background: transparent;
      border: none;
      color: #9ca3af;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
    }
    .btn-close:hover {
      background: #1f2937;
      color: #fff;
    }
    .disclaimer-banner {
      margin: 1.25rem 1.75rem 0;
      background: rgba(59, 130, 246, 0.08);
      border: 1px solid rgba(59, 130, 246, 0.25);
      border-radius: 0.75rem;
      padding: 0.85rem 1rem;
      display: flex;
      gap: 0.85rem;
      align-items: flex-start;
    }
    .banner-icon { font-size: 1.25rem; }
    .banner-text strong { color: #60a5fa; font-size: 0.85rem; }
    .banner-text p { margin: 0.25rem 0 0; color: #cbd5e1; font-size: 0.8rem; line-height: 1.4; }
    
    .tab-nav {
      display: flex;
      padding: 1rem 1.75rem 0;
      gap: 0.5rem;
    }
    .tab-nav button {
      background: transparent;
      border: none;
      border-bottom: 2px solid transparent;
      color: #9ca3af;
      padding: 0.6rem 1rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .tab-nav button.active {
      color: #38bdf8;
      border-bottom-color: #38bdf8;
    }
    .tab-content {
      padding: 1.25rem 1.75rem;
      overflow-y: auto;
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }
    .form-group label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #e5e7eb;
    }
    .provider-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
    .provider-option {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 0.75rem;
      padding: 0.75rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .provider-option.selected {
      border-color: #38bdf8;
      background: rgba(56, 189, 248, 0.1);
    }
    .provider-info strong { display: block; font-size: 0.85rem; color: #f8fafc; }
    .provider-info span { display: block; font-size: 0.72rem; color: #94a3b8; }
    .input-with-action {
      display: flex;
      position: relative;
    }
    .input-with-action input {
      padding-right: 2.75rem;
    }
    .btn-toggle-eye {
      position: absolute;
      right: 0.5rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      font-size: 1rem;
    }
    .form-control {
      background: #0f172a;
      border: 1px solid #334155;
      color: #f8fafc;
      padding: 0.65rem 0.85rem;
      border-radius: 0.6rem;
      font-size: 0.9rem;
      width: 100%;
      box-sizing: border-box;
      outline: none;
    }
    .form-control:focus {
      border-color: #38bdf8;
    }
    textarea.form-control {
      resize: vertical;
      line-height: 1.4;
      font-family: inherit;
    }
    .text-sm { font-size: 0.82rem; }
    .helper-text { font-size: 0.75rem; color: #94a3b8; }
    .helper-text a { color: #38bdf8; text-decoration: none; }
    .helper-text a:hover { text-decoration: underline; }
    .reset-row {
      display: flex;
      justify-content: flex-end;
    }
    .btn-secondary {
      background: #1e293b;
      border: 1px solid #334155;
      color: #cbd5e1;
      padding: 0.4rem 0.85rem;
      border-radius: 0.5rem;
      cursor: pointer;
    }
    .modal-footer {
      padding: 1.25rem 1.75rem;
      border-top: 1px solid #1f2937;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .right-actions {
      display: flex;
      gap: 0.75rem;
      margin-left: auto;
    }
    .btn-primary {
      background: linear-gradient(135deg, #0284c7 0%, #2563eb 100%);
      color: white;
      border: none;
      padding: 0.65rem 1.25rem;
      border-radius: 0.6rem;
      font-weight: 600;
      cursor: pointer;
    }
    .btn-primary:hover { opacity: 0.95; }
    .btn-cancel {
      background: transparent;
      border: 1px solid #334155;
      color: #94a3b8;
      padding: 0.65rem 1.1rem;
      border-radius: 0.6rem;
      cursor: pointer;
    }
    .btn-danger-outline {
      background: transparent;
      border: 1px solid rgba(239, 68, 68, 0.4);
      color: #f87171;
      padding: 0.5rem 0.85rem;
      border-radius: 0.5rem;
      font-size: 0.82rem;
      cursor: pointer;
    }
  `]
})
export class AiConfigModalComponent {
  @Output() closed = new EventEmitter<void>();

  private aiStorage = inject(AiKeyStorageService);

  public activeTab = signal<'keys' | 'prompts'>('keys');
  public showKey = false;

  public formConfig: AiConfig = { ...this.aiStorage.config() };
  public formPrompts: CustomPrompts = { ...this.aiStorage.prompts() };

  public hasConfiguredKey = this.aiStorage.hasUserKey;

  public onProviderChange(): void {
    if (this.formConfig.provider === 'openai') {
      this.formConfig.model = 'gpt-4o-mini';
    } else if (this.formConfig.provider === 'gemini') {
      this.formConfig.model = 'gemini-1.5-flash';
    } else if (this.formConfig.provider === 'groq') {
      this.formConfig.model = 'llama-3.1-8b-instant';
    }
  }

  public getPlaceholder(): string {
    if (this.formConfig.provider === 'openai') return 'sk-proj-...';
    if (this.formConfig.provider === 'gemini') return 'AIzaSy...';
    if (this.formConfig.provider === 'groq') return 'gsk_...';
    return 'Insira sua chave de API';
  }

  public resetPrompts(): void {
    this.formPrompts = { ...DEFAULT_PROMPTS };
  }

  public clearKey(): void {
    this.formConfig.apiKey = '';
    this.aiStorage.clearKey();
  }

  public save(): void {
    this.aiStorage.saveConfig(this.formConfig);
    this.aiStorage.savePrompts(this.formPrompts);
    this.closed.emit();
  }

  public close(): void {
    this.closed.emit();
  }
}
