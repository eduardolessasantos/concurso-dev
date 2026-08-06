import { Component, inject, signal, HostListener } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StoreService } from './services/store.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private store = inject(StoreService);
  sidebarOpen = signal(false);

  get theme() { return this.store.state().theme; }

  toggleTheme() { this.store.toggleTheme(); }
  toggleSidebar() { this.sidebarOpen.update(v => !v); }
  closeSidebar() { this.sidebarOpen.set(false); }

  @HostListener('document:keydown.escape')
  onEsc() { this.sidebarOpen.set(false); }
}
