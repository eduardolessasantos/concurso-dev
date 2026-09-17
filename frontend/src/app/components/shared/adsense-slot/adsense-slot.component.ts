import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { environment } from '../../../../environments/environment';

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

@Component({
  selector: 'app-adsense-slot',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './adsense-slot.component.html',
  styleUrls: ['./adsense-slot.component.scss']
})
export class AdSenseSlotComponent implements OnInit {
  @Input() public adSlot: string = '';
  @Input() public adFormat: string = 'auto';
  @Input() public fullWidthResponsive: boolean = true;
  @Input() public adClient: string = environment.adsensePublisherId || 'pub-XXXXXXXXXXXXXXXX';

  public isDevelopment = signal<boolean>(!environment.production || !environment.adsensePublisherId || environment.adsensePublisherId.includes('XXXX'));

  ngOnInit(): void {
    if (!this.isDevelopment()) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (err) {
        console.warn('Google AdSense error pushing ad unit:', err);
      }
    }
  }
}
