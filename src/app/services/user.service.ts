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
    supabase.auth.getUser().then((authData) => {
      if (authData.data?.user) {
        this.loadUserData();
      } else {
        this.userDataSubject.next(null);
      }
    });
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

  async loadUserData(): Promise<void> {
    this.loadPromise = (async () => {
      const { data: authData, error: authError } =
        await supabase.auth.getUser();

      if (authError || !authData.user) {
        this.userDataSubject.next(null);
        return;
      }

      const userId = authData.user.id;

      try {
        const { data: userRecords, error } = await supabase
          .from('Usuarios')
          .select('*')
          .eq('authId', userId)
          .single();

        if (error || !userRecords) {
          console.log('Usuario no encontrado en la tabla. Insertando datos...');

          if (this.tempUserData) {
            const { avatarFile, name, age } = this.tempUserData;

            let avatarPath = '';
            if (avatarFile) {
              const uniqueFilename = `${userId}_${Date.now()}_${
                avatarFile.name
              }`;
              avatarPath = `avatarUsuarios/${uniqueFilename}`;

              const { error: uploadError } = await supabase.storage
                .from('imagenes')
                .upload(avatarPath, avatarFile, {
                  cacheControl: '3600',
                  upsert: false,
                });

              if (uploadError) {
                console.error('Error al subir avatar:', uploadError.message);
                this.userDataSubject.next(null);
                return;
              }
            }

            const { data: newUser, error: insertError } = await supabase
              .from('Usuarios')
              .insert([
                {
                  authId: userId,
                  nombre: name || authData.user.email,
                  edad: age || 0,
                  avatarUrl: avatarPath,
                },
              ])
              .select()
              .single();

            if (insertError) {
              console.error(
                'Error al insertar datos del usuario:',
                insertError.message
              );
              this.userDataSubject.next(null);
              return;
            }

            this.userDataSubject.next(newUser);
          } else {
            console.error('No hay datos temporales del usuario para insertar.');
            this.userDataSubject.next(null);
          }
        } else {
          this.userDataSubject.next(userRecords);
        }
      } catch (err) {
        console.error('Error al cargar los datos del usuario:', err);
        this.userDataSubject.next(null);
      }
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
