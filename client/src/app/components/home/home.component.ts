import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <ul class="breadcrumb">
      <li>Home</li>
    </ul>
    <div class="list-group">
      <a routerLink="/cards" class="list-group-item list-group-item-action">
        <span class="float-end">→</span>
        <h4 class="list-group-item-heading">Cards</h4>
        <p class="list-group-item-text">Used by members to access resources</p>
      </a>
      <a routerLink="/keycodes" class="list-group-item list-group-item-action">
        <span class="float-end">→</span>
        <h4 class="list-group-item-heading">Keycodes</h4>
        <p class="list-group-item-text">Used by guests to access resources</p>
      </a>
      <a routerLink="/resources" class="list-group-item list-group-item-action">
        <span class="float-end">→</span>
        <h4 class="list-group-item-heading">Resources</h4>
        <p class="list-group-item-text">Items that members can access</p>
      </a>
      <a routerLink="/logs" class="list-group-item list-group-item-action">
        <span class="float-end">→</span>
        <h4 class="list-group-item-heading">Logs</h4>
        <p class="list-group-item-text">Records of access attempts</p>
      </a>
      <a routerLink="/users" class="list-group-item list-group-item-action">
        <span class="float-end">→</span>
        <h4 class="list-group-item-heading">Users</h4>
        <p class="list-group-item-text">
          People that can configure this system
        </p>
      </a>
    </div>
  `,
  styles: [
    `
      .float-end {
        font-size: 2.5em;
        float: right;
      }
    `,
  ],
})
export class HomeComponent {}
