import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PublicShowcaseService, ExploreItem } from '../../services/public-showcase.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-landing-page',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './landing-page.component.html',
  styleUrls: ['./landing-page.component.scss']
})
export class LandingPageComponent implements OnInit {
  public searchTerm = signal<string>('');
  public featuredOfferings = signal<ExploreItem[]>([]);
  public isLoadingFeatured = signal<boolean>(true);

  // Chips populares de matérias
  public popularSubjects = [
    { name: 'Matemática', icon: '📐' },
    { name: 'Física', icon: '⚡' },
    { name: 'Redação', icon: '✍️' },
    { name: 'Concursos Públicos', icon: '🏛️' },
    { name: 'Inglês', icon: '🇬🇧' },
    { name: 'Química', icon: '🧪' },
    { name: 'Programação', icon: '💻' }
  ];

  // Avatares modernos com ilustrações humanas Sally UX
  public teacherAvatars = [
    {
      name: 'Prof. Carlos Mendes',
      subject: 'Matemática & Física',
      image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      badge: 'Mentor Verificado'
    },
    {
      name: 'Profa. Mariana Luz',
      subject: 'Redação Nota 1000',
      image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&auto=format&fit=crop&q=80',
      badge: 'Estúdio IA Ativo'
    },
    {
      name: 'Prof. Roberto Silva',
      subject: 'Direito Constitucional',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      badge: '+120 Alunos'
    }
  ];

  constructor(
    private showcaseService: PublicShowcaseService,
    public authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadFeatured();
  }

  loadFeatured(): void {
    this.isLoadingFeatured.set(true);
    this.showcaseService.explore({ pageSize: 6 }).subscribe({
      next: (res) => {
        this.featuredOfferings.set(res.items || []);
        this.isLoadingFeatured.set(false);
      },
      error: () => {
        this.isLoadingFeatured.set(false);
      }
    });
  }

  onSearch(): void {
    const term = this.searchTerm().trim();
    if (term) {
      this.router.navigate(['/explorar'], { queryParams: { search: term } });
    } else {
      this.router.navigate(['/explorar']);
    }
  }

  searchBySubject(subject: string): void {
    this.router.navigate(['/explorar'], { queryParams: { subject } });
  }
}
