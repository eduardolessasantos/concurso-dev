import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-cookie-consent',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './cookie-consent.component.html',
  styleUrls: ['./cookie-consent.component.scss']
})
export class CookieConsentComponent implements OnInit {
  private readonly CONSENT_KEY = 'teachertech_cookie_consent_v1';
  public showBanner = signal<boolean>(false);
  public showModal = signal<boolean>(false);

  // Preferências
  public essentialCookies = true; // Sempre ativo
  public analyticsCookies = true;
  public advertisingCookies = true;

  ngOnInit(): void {
    const saved = localStorage.getItem(this.CONSENT_KEY);
    if (!saved) {
      // Exibe banner após breve intervalo para transição suave
      setTimeout(() => {
        this.showBanner.set(true);
      }, 800);
    } else {
      try {
        const parsed = JSON.parse(saved);
        this.analyticsCookies = parsed.analytics ?? true;
        this.advertisingCookies = parsed.advertising ?? true;
      } catch {
        this.showBanner.set(true);
      }
    }
  }

  public acceptAll(): void {
    this.analyticsCookies = true;
    this.advertisingCookies = true;
    this.saveConsent();
    this.showBanner.set(false);
    this.showModal.set(false);
  }

  public acceptEssentialOnly(): void {
    this.analyticsCookies = false;
    this.advertisingCookies = false;
    this.saveConsent();
    this.showBanner.set(false);
    this.showModal.set(false);
  }

  public openPreferences(): void {
    this.showModal.set(true);
  }

  public savePreferences(): void {
    this.saveConsent();
    this.showBanner.set(false);
    this.showModal.set(false);
  }

  private saveConsent(): void {
    const consent = {
      essential: true,
      analytics: this.analyticsCookies,
      advertising: this.advertisingCookies,
      timestamp: new Date().toISOString()
    };
    localStorage.setItem(this.CONSENT_KEY, JSON.stringify(consent));
  }
}
