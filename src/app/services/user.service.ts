import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Usuarios } from '../models/Usuarios';
import { supabase } from '../supabase-client';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private userDataSubject = new BehaviorSubject<Usuarios | null>(null);
  userData$ = this.userDataSubject.asObservable();

  constructor() {
    this.loadUserData();
  }

  tempUserData: { name: string; age: number; avatarFile: File } | null = null;

  async registerUser(
    name: string,
    age: number,
    email: string,
    password: string,
    avatarFile: File
  ): Promise<{ success: boolean; error?: string }> {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (data.user?.identities?.length === 0) {
      return {
        success: false,
        error: 'Este correo ya está registrado. Por favor, usa otro.',
      };
    }

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || 'No se pudo registrar el usuario.',
      };
    }

    this.tempUserData = { name, age, avatarFile };

    return { success: true };
  }

  getCurrentUser() {
    return this.userDataSubject.getValue();
  }

  private loadPromise: Promise<void> | null = null;

  loadUserData(): Promise<void> {
    this.loadPromise = (async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        this.userDataSubject.next(null);
        return;
      }

      const userId = authData.user.id;

      // eslint-disable-next-line prefer-const
      let { data: userRecord, error } = await supabase
        .from('Usuarios')
        .select('*')
        .eq('authId', userId)
        .single();

      if (error && error.code === 'PGRST116') {
        if (this.tempUserData) {
          const avatarPath = `avatarUsuarios/${this.tempUserData.avatarFile.name}`;
          const { error: uploadError } = await supabase.storage
            .from('imagenes')
            .upload(avatarPath, this.tempUserData.avatarFile, {
              cacheControl: '3600',
              upsert: false,
            });

          if (uploadError) {
            console.error('Error al subir avatar:', uploadError.message);
            return;
          }

          const { error: insertError, data: newUser } = await supabase
            .from('Usuarios')
            .insert([
              {
                authId: userId,
                nombre: this.tempUserData.name,
                edad: this.tempUserData.age,
                avatarUrl: avatarPath,
              },
            ])
            .select()
            .single();

          if (insertError) {
            console.error('Error al guardar el usuario:', insertError.message);
            return;
          }

          userRecord = newUser;
          this.tempUserData = null;
        }
      }

      this.userDataSubject.next(userRecord || null);
    })();

    return this.loadPromise;
  }

  async logout() {
    await supabase.auth.signOut();
    this.userDataSubject.next(null);
    this.loadPromise = null;
  }

  getAvatarUrl(path: string): string {
    return supabase.storage.from('imagenes').getPublicUrl(path).data.publicUrl;
  }
}
