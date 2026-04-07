export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type RegistrationParticipant = {
  name: string;
  age: string;
  signature_confirmed: boolean;
};

export type Database = {
  public: {
    Tables: {
      members: {
        Row: {
          id: string;
          full_name: string;
          email: string;
          studio_name: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name: string;
          email: string;
          studio_name: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string;
          email?: string;
          studio_name?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      registrations: {
        Row: {
          id: string;
          created_at: string;
          status: string;
          contestant_name: string;
          age: string;
          studio_name: string;
          teacher_name: string;
          routine_name: string;
          phone: string;
          email: string;
          years_of_training: string;
          soloist_address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          studio_address: string | null;
          studio_city: string | null;
          studio_state: string | null;
          studio_zip: string | null;
          category: string;
          age_division: string;
          ability_level: string;
          group_size: string;
          contestant_count: number;
          total_fee: number;
          payment_method: string;
          participants: Json | null;
          disclaimer_accepted: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          status?: string;
          contestant_name: string;
          age: string;
          studio_name: string;
          teacher_name: string;
          routine_name: string;
          phone: string;
          email: string;
          years_of_training: string;
          soloist_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          studio_address?: string | null;
          studio_city?: string | null;
          studio_state?: string | null;
          studio_zip?: string | null;
          category: string;
          age_division: string;
          ability_level: string;
          group_size: string;
          contestant_count: number;
          total_fee: number;
          payment_method: string;
          participants?: Json | null;
          disclaimer_accepted: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          status?: string;
          contestant_name?: string;
          age?: string;
          studio_name?: string;
          teacher_name?: string;
          routine_name?: string;
          phone?: string;
          email?: string;
          years_of_training?: string;
          soloist_address?: string | null;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          studio_address?: string | null;
          studio_city?: string | null;
          studio_state?: string | null;
          studio_zip?: string | null;
          category?: string;
          age_division?: string;
          ability_level?: string;
          group_size?: string;
          contestant_count?: number;
          total_fee?: number;
          payment_method?: string;
          participants?: Json | null;
          disclaimer_accepted?: boolean;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          created_at: string;
          section: string;
          url: string;
          filename: string;
          caption: string | null;
          is_visible: boolean;
          is_members_only: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          section: string;
          url: string;
          filename: string;
          caption?: string | null;
          is_visible?: boolean;
          is_members_only?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          section?: string;
          url?: string;
          filename?: string;
          caption?: string | null;
          is_visible?: boolean;
          is_members_only?: boolean;
        };
        Relationships: [];
      };
      gallery_videos: {
        Row: {
          id: string;
          created_at: string;
          section: string;
          url: string;
          title: string;
          is_visible: boolean;
        };
        Insert: {
          id?: string;
          created_at?: string;
          section: string;
          url: string;
          title: string;
          is_visible?: boolean;
        };
        Update: {
          id?: string;
          created_at?: string;
          section?: string;
          url?: string;
          title?: string;
          is_visible?: boolean;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          name: string;
          date: string;
          location: string;
          description: string | null;
          is_active: boolean;
          created_at?: string;
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
        Relationships: [];
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
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
