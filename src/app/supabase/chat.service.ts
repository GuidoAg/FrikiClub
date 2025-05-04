import { Injectable, signal } from '@angular/core';
import { SupabaseClient } from '@supabase/supabase-js';
import { Ichat } from '../interface/chat-response';
import { UserService } from '../services/user.service';
import { supabase } from '../supabase-client';

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private supabase!: SupabaseClient;
  public savedChat = signal<Ichat[]>([]);

  constructor(private userService: UserService) {
    this.supabase = supabase;
    this.listenForNewMessages();
  }

  async chatMessage(text: string, senderId: number) {
    try {
      const { error } = await this.supabase
        .from('chat')
        .insert({ text, editable: false, sender: senderId });

      if (error) {
        alert(error.message);
      }
    } catch (error) {
      alert(error);
    }
  }

  async listChat() {
    const { data, error } = await this.supabase
      .from('chat')
      .select('*,Usuarios(*)')
      .order('created_at', { ascending: true });

    if (error) {
      alert(error.message);
    }

    return data;
  }

  async deleteChat(id: string) {
    const data = await this.supabase.from('chat').delete().eq('id', id);
    return data;
  }

  public setChatHistory(history: Ichat[]) {
    this.savedChat.set(history);
  }

  public addNewMessage(msg: Ichat) {
    const previousMessages = this.savedChat();
    this.savedChat.set([...previousMessages, msg]);
  }

  listenForNewMessages() {
    this.supabase
      .channel('chat_channel')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'chat' },
        async (payload) => {
          const message = payload.new as Ichat;

          const { data: usuario, error } = await this.supabase
            .from('Usuarios')
            .select('*')
            .eq('id', message.sender)
            .single();

          if (!error && usuario) {
            message.Usuarios = usuario;
          }
          this.addNewMessage(message);
        }
      )
      .subscribe();
  }
}
