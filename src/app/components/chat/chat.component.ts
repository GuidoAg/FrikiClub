import {
  Component,
  effect,
  inject,
  signal,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { UserService } from '../../services/user.service';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ChatService } from '../../supabase/chat.service';
import { Ichat } from '../../interface/chat-response';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'friki-club-chat',
  standalone: true,
  imports: [ReactiveFormsModule, DatePipe],
  templateUrl: './chat.component.html',
  styleUrl: './chat.component.scss',
})
export class ChatComponent {
  private auth = inject(UserService);
  private chat_service = inject(ChatService);
  private fb = inject(FormBuilder);
  private messageTimestamps: number[] = [];
  private MAX_MESSAGES_PER_MINUTE = 5;
  chats = signal<Ichat[]>([]);

  @ViewChild('chatContainer') chatContainer!: ElementRef;

  chatForm!: FormGroup;

  constructor(private chatService: ChatService) {
    this.chatForm = this.fb.group({
      chat_message: ['', [Validators.required, Validators.maxLength(300)]],
    });

    this.onListChat();

    effect(() => {
      const chatList = this.chatService.savedChat();
      this.chats.set(chatList);
      setTimeout(() => this.scrollToBottom(), 100);
    });
  }

  onSubmit() {
    const formValue = this.chatForm.value.chat_message?.trim();
    const currentUser = this.auth.getCurrentUser();

    if (!currentUser || !currentUser.id) {
      alert('Usuario no identificado');
      return;
    }

    if (!formValue) {
      return;
    }
    const now = Date.now();
    this.messageTimestamps = this.messageTimestamps.filter(
      (timestamp) => now - timestamp < 60000
    );

    if (this.messageTimestamps.length >= this.MAX_MESSAGES_PER_MINUTE) {
      alert(
        'Has enviado demasiados mensajes en poco tiempo. Espera unos segundos.'
      );
      return;
    }

    this.messageTimestamps.push(now);

    this.chat_service
      .chatMessage(formValue, currentUser.id)
      .then(() => {
        this.chatForm.reset();
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop =
        this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {
      console.error('Error al hacer scroll:', err);
    }
  }

  getAvatarUrl(path?: string | null): string {
    if (!path) return 'ruta/al/avatar/default.png';
    return this.auth.getAvatarUrl(path);
  }

  onListChat() {
    this.chat_service
      .listChat()
      .then((res: Ichat[] | null) => {
        if (res !== null) {
          this.chat_service.setChatHistory(res);
        }
      })
      .catch((err) => {
        alert(err.message);
      });
  }
}
