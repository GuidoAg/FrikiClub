import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../../services/user.service';
import { ElementRef, HostListener, ViewChild } from '@angular/core';

@Component({
  selector: 'friki-club-navbar',
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent {
  private userService = inject(UserService);
  protected router = inject(Router);
  dropdownOpen = false;

  userData$ = this.userService.userData$;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef;

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    if (
      this.dropdownOpen &&
      this.dropdownRef &&
      !this.dropdownRef.nativeElement.contains(event.target)
    ) {
      this.dropdownOpen = false;
    }
  }

  navigate(path: string) {
    this.router.navigate([path]);
  }

  getAvatarUrl(path: string) {
    return this.userService.getAvatarUrl(path);
  }

  async logout() {
    await this.userService.logout();
    this.router.navigate(['/login']);
  }

  toggleDropdown() {
    this.dropdownOpen = !this.dropdownOpen;
  }

  closeDropdown() {
    this.dropdownOpen = false;
  }
}
