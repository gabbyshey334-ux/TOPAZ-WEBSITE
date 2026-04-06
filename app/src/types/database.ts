export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
    Tables: {
      registrations: {
        Row: {
          id: string;
          created_at: string;
          contestant_name: string;
          age: number;
          studio_name: string;
          teacher_name: string;
          routine_name: string;
          soloist_address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          phone: string;
          email: string;
          years_of_training: number;
          studio_address: string | null;
          studio_city: string | null;
          studio_state: string | null;
          studio_zip: string | null;
          category: string;
          age_division: string;
          ability_level: string;
          group_size: string;
          payment_method: string;
          status: string;
          notes: string | null;
          participants_json: Json;
          contestant_count: number;
          total_fee: number;
          disclaimer_accepted: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          contestant_name: string;
          age: number;
          studio_name: string;
          teacher_name: string;
          routine_name: string;
          soloist_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          phone: string;
          email: string;
          years_of_training: number;
          studio_address?: string | null;
          studio_city?: string | null;
          studio_state?: string | null;
          studio_zip?: string | null;
          category: string;
          age_division: string;
          ability_level: string;
          group_size: string;
          payment_method: string;
          status?: string;
          notes?: string | null;
          participants_json?: Json;
          contestant_count?: number;
          total_fee?: number;
          disclaimer_accepted?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          contestant_name?: string;
          age?: number;
          studio_name?: string;
          teacher_name?: string;
          routine_name?: string;
          soloist_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          phone?: string;
          email?: string;
          years_of_training?: number;
          studio_address?: string | null;
          studio_city?: string | null;
          studio_state?: string | null;
          studio_zip?: string | null;
          category?: string;
          age_division?: string;
          ability_level?: string;
          group_size?: string;
          payment_method?: string;
          status?: string;
          notes?: string | null;
          participants_json?: Json;
          contestant_count?: number;
          total_fee?: number;
          disclaimer_accepted?: boolean;
        };
      };
      gallery_images: {
        Row: {
          id: string;
          created_at: string;
          filename: string | null;
          url: string;
          section: 'history' | 'topaz2';
          caption: string | null;
          is_visible: boolean;
          is_members_only: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          filename?: string | null;
          url: string;
          section: 'history' | 'topaz2';
          caption?: string | null;
          is_visible?: boolean;
          is_members_only?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          filename?: string | null;
          url?: string;
          section?: 'history' | 'topaz2';
          caption?: string | null;
          is_visible?: boolean;
          is_members_only?: boolean;
        };
      };
      gallery_videos: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          url: string;
          section: 'history' | 'topaz2';
          is_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          url: string;
          section: 'history' | 'topaz2';
          is_visible?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          url?: string;
          section?: 'history' | 'topaz2';
          is_visible?: boolean;
        };
      };
      members: {
        Row: {
          id: string;
          created_at: string;
          email: string;
          full_name: string | null;
          studio_name: string | null;
          role: string;
          is_approved: boolean;
        };
        Insert: {
          id: string;
          created_at?: string;
          email: string;
          full_name?: string | null;
          studio_name?: string | null;
          role?: string;
          is_approved?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          email?: string;
          full_name?: string | null;
          studio_name?: string | null;
          role?: string;
          is_approved?: boolean;
        };
      };
      events: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          date: string;
          location: string;
          description: string | null;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          date: string;
          location: string;
          description?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          date?: string;
          location?: string;
          description?: string | null;
          is_active?: boolean;
        };
      };
      announcements: {
        Row: {
          id: string;
          created_at: string;
          title: string;
          body: string;
          is_active: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          title: string;
          body: string;
          is_active?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          title?: string;
          body?: string;
          is_active?: boolean;
        };
      };
    };
  };
}

