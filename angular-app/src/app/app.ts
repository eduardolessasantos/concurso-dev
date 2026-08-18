import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, Router } from '@angular/router';
import { StoreService } from './services/store.service';
import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private store = inject(StoreService);
  private router = inject(Router);
  public authService = inject(AuthService);
  sidebarOpen = signal(false);

  get theme() { return this.store.state().theme; }

  toggleTheme() { this.store.toggleTheme(); }
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar() { this.sidebarOpen.set(false); }

  logout() {
    this.authService.logout();
    this.closeSidebar();
    this.router.navigate(['/login']);
  }

  @HostListener('document:keydown.escape')
  onEsc() { this.sidebarOpen.set(false); }
}
