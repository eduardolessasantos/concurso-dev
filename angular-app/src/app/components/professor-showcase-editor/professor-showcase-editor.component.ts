import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ProfessorManagementService, UpdateProfessorShowcase, SocialLinks } from '../../services/professor-management.service';
import { PublicProfessorProfile } from '../../services/public-showcase.service';

@Component({
  selector: 'app-professor-showcase-editor',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './professor-showcase-editor.component.html',
  styleUrls: ['./professor-showcase-editor.component.scss']
})
export class ProfessorShowcaseEditorComponent implements OnInit {
  public isLoading = signal<boolean>(true);
  public isSaving = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  // Perfil base carregado
  public originalProfile = signal<PublicProfessorProfile | null>(null);

  // Estados reativos do formulário
  public fullName = signal<string>('');
  public avatarUrl = signal<string>('');
  public headline = signal<string>('');
  public bio = signal<string>('');
  public customSlug = signal<string>('');
  public bannerImageUrl = signal<string>('');
  public themeColor = signal<string>('#4F46E5');
  public whatsAppNumber = signal<string>('');
  public videoIntroUrl = signal<string>('');
  public city = signal<string>('');
  public state = signal<string>('');
  public publicVisibility = signal<boolean>(true);

  // Redes Sociais
  public instagram = signal<string>('');
  public linkedin = signal<string>('');
  public youtube = signal<string>('');
  public website = signal<string>('');

  // Validação do Slug
  public isCheckingSlug = signal<boolean>(false);
  public isSlugAvailable = signal<boolean | null>(null);
  private slugDebounceTimer: any;

  // Visualização de Preview (Desktop vs Mobile)
  public previewMode = signal<'desktop' | 'mobile'>('mobile');

  // Cores de tema pré-definidas
  public presetColors = [
    { name: 'Índigo Real', hex: '#4F46E5' },
    { name: 'Violeta Elétrico', hex: '#7C3AED' },
    { name: 'Azul Moderno', hex: '#2563EB' },
    { name: 'Esmeralda', hex: '#059669' },
    { name: 'Rosa Vibrante', hex: '#DB2777' },
    { name: 'Âmbar Premium', hex: '#D97706' }
  ];

  // Vídeo embutido sanitizado para o preview
  public sanitizedVideoUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.videoIntroUrl();
    if (!url) return null;

    let embedUrl = '';
    const youtubeMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (youtubeMatch && youtubeMatch[1]) {
      embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    } else {
      const vimeoMatch = url.match(/vimeo\.com\/(?:channels\/(?:\w+\/)?|groups\/(?:[^\/]*)\/videos\/|album\/(?:\d+)\/video\/|video\/|)(\d+)/);
      if (vimeoMatch && vimeoMatch[1]) {
        embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      }
    }

    return embedUrl ? this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl) : null;
  });

  constructor(
    private managementService: ProfessorManagementService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.loadShowcase();
  }

  loadShowcase(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.managementService.getMyShowcase().subscribe({
      next: (profile) => {
        this.originalProfile.set(profile);
        this.fullName.set(profile.fullName || 'Professor(a)');
        this.avatarUrl.set(profile.avatarUrl || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80');
        this.headline.set(profile.headline || '');
        this.bio.set(profile.bio || '');
        this.customSlug.set(profile.customSlug || '');
        this.bannerImageUrl.set(profile.bannerImageUrl || '');
        this.themeColor.set(profile.themeColor || '#4F46E5');
        this.whatsAppNumber.set(profile.whatsAppNumber || '');
        this.videoIntroUrl.set(profile.videoIntroUrl || '');
        this.city.set(profile.city || '');
        this.state.set(profile.state || '');

        if (profile.socialLinksJson) {
          try {
            const social: SocialLinks = JSON.parse(profile.socialLinksJson);
            this.instagram.set(social.instagram || '');
            this.linkedin.set(social.linkedin || '');
            this.youtube.set(social.youtube || '');
            this.website.set(social.website || '');
          } catch {
            // json legado ou vazio
          }
        }

        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Não foi possível carregar as informações da sua vitrine.');
        this.isLoading.set(false);
      }
    });
  }

  onSlugChange(value: string): void {
    const clean = value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
    this.customSlug.set(clean);
    this.isSlugAvailable.set(null);

    if (this.slugDebounceTimer) {
      clearTimeout(this.slugDebounceTimer);
    }

    if (!clean || clean.length < 3) return;

    this.isCheckingSlug.set(true);
    this.slugDebounceTimer = setTimeout(() => {
      this.managementService.checkSlugAvailability(clean).subscribe({
        next: (res) => {
          this.isSlugAvailable.set(res.available);
          this.isCheckingSlug.set(false);
        },
        error: () => {
          this.isCheckingSlug.set(false);
        }
      });
    }, 450);
  }

  selectThemeColor(hex: string): void {
    this.themeColor.set(hex);
  }

  setPreviewMode(mode: 'desktop' | 'mobile'): void {
    this.previewMode.set(mode);
  }

  saveShowcase(): void {
    this.isSaving.set(true);
    this.successMessage.set(null);
    this.errorMessage.set(null);

    const social: SocialLinks = {
      instagram: this.instagram().trim() || undefined,
      linkedin: this.linkedin().trim() || undefined,
      youtube: this.youtube().trim() || undefined,
      website: this.website().trim() || undefined
    };

    const payload: UpdateProfessorShowcase = {
      headline: this.headline().trim(),
      bio: this.bio().trim(),
      customSlug: this.customSlug().trim(),
      bannerImageUrl: this.bannerImageUrl().trim() || undefined,
      themeColor: this.themeColor(),
      whatsAppNumber: this.whatsAppNumber().trim() || undefined,
      videoIntroUrl: this.videoIntroUrl().trim() || undefined,
      city: this.city().trim() || undefined,
      state: this.state().trim() || undefined,
      socialLinksJson: JSON.stringify(social),
      publicVisibility: this.publicVisibility()
    };

    this.managementService.updateMyShowcase(payload).subscribe({
      next: (updated) => {
        this.originalProfile.set(updated);
        this.isSaving.set(false);
        this.successMessage.set('Vitrine virtual atualizada com sucesso!');
        setTimeout(() => this.successMessage.set(null), 4000);
      },
      error: (err) => {
        this.isSaving.set(false);
        if (err.status === 409) {
          this.errorMessage.set('O link personalizado escolhido já está em uso por outro professor.');
        } else {
          this.errorMessage.set(err.error?.message || 'Falha ao salvar as alterações da vitrine.');
        }
      }
    });
  }
}
