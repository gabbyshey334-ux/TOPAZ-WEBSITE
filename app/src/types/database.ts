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
          full_name: string | null;
          email: string;
          studio_name: string | null;
          role: string;
          is_approved: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email: string;
          studio_name?: string | null;
          role?: string;
          is_approved?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string;
          studio_name?: string | null;
          role?: string;
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
          // Dancer info
          contestant_name: string;
          age: string;
          date_of_birth: string | null;
          studio_name: string;
          teacher_name: string;
          routine_name: string;
          group_link_code: string;
          phone: string;
          email: string;
          years_of_training: string;
          parent_guardian_name: string | null;
          // Address (optional)
          soloist_address: string | null;
          city: string | null;
          state: string | null;
          zip: string | null;
          studio_address: string | null;
          studio_city: string | null;
          studio_state: string | null;
          studio_zip: string | null;
          // Competition entry
          category: string;
          age_division: string;
          ability_level: string;
          group_size: string;
          contestant_count: number;
          total_fee: number;
          payment_method: string;
          participants_json: Json | null;
          // Music
          song_title: string | null;
          artist_name: string | null;
          music_delivery_method: string;
          music_file_url: string | null;
          // Flags
          disclaimer_accepted: boolean;
          notes: string | null;
          // Scoring app sync
          scoring_app_sync_status: string;
          scoring_app_contestant_id: string | null;
          scoring_app_synced_at: string | null;
          scoring_app_sync_error: string | null;
          // Confirmation email tracking
          confirmation_email_sent_at: string | null;
          confirmation_email_error: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          status?: string;
          contestant_name: string;
          age: string;
          date_of_birth?: string | null;
          studio_name: string;
          teacher_name: string;
          routine_name: string;
          group_link_code?: string;
          phone: string;
          email: string;
          years_of_training: string;
          parent_guardian_name?: string | null;
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
          participants_json?: Json | null;
          song_title?: string | null;
          artist_name?: string | null;
          music_delivery_method?: string;
          music_file_url?: string | null;
          disclaimer_accepted: boolean;
          notes?: string | null;
          scoring_app_sync_status?: string;
          scoring_app_contestant_id?: string | null;
          scoring_app_synced_at?: string | null;
          scoring_app_sync_error?: string | null;
          confirmation_email_sent_at?: string | null;
          confirmation_email_error?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          status?: string;
          contestant_name?: string;
          age?: string;
          date_of_birth?: string | null;
          studio_name?: string;
          teacher_name?: string;
          routine_name?: string;
          group_link_code?: string;
          phone?: string;
          email?: string;
          years_of_training?: string;
          parent_guardian_name?: string | null;
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
          participants_json?: Json | null;
          song_title?: string | null;
          artist_name?: string | null;
          music_delivery_method?: string;
          music_file_url?: string | null;
          disclaimer_accepted?: boolean;
          notes?: string | null;
          scoring_app_sync_status?: string;
          scoring_app_contestant_id?: string | null;
          scoring_app_synced_at?: string | null;
          scoring_app_sync_error?: string | null;
          confirmation_email_sent_at?: string | null;
          confirmation_email_error?: string | null;
        };
        Relationships: [];
      };
      gallery_images: {
        Row: {
          id: string;
          created_at: string;
          section: string;
          url: string;
          filename: string | null;
          caption: string | null;
          is_visible: boolean;
          is_members_only: boolean;
          is_protected: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          section: string;
          url: string;
          filename?: string | null;
          caption?: string | null;
          is_visible?: boolean;
          is_members_only?: boolean;
          is_protected?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          section?: string;
          url?: string;
          filename?: string | null;
          caption?: string | null;
          is_visible?: boolean;
          is_members_only?: boolean;
          is_protected?: boolean;
          display_order?: number;
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
          is_protected: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          section: string;
          url: string;
          title: string;
          is_visible?: boolean;
          is_protected?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          section?: string;
          url?: string;
          title?: string;
          is_visible?: boolean;
          is_protected?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
      gallery_settings: {
        Row: {
          id: number;
          gallery_password: string | null;
          password_hint: string | null;
          updated_at: string;
        };
        Insert: {
          id: number;
          gallery_password?: string | null;
          password_hint?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          gallery_password?: string | null;
          password_hint?: string | null;
          updated_at?: string;
        };
        Relationships: [];
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
          registration_open_date: string | null;
          registration_close_date: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          date: string;
          location: string;
          description?: string | null;
          is_active?: boolean;
          registration_open_date?: string | null;
          registration_close_date?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          date?: string;
          location?: string;
          description?: string | null;
          is_active?: boolean;
          registration_open_date?: string | null;
          registration_close_date?: string | null;
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
      testimonials: {
        Row: {
          id: string;
          created_at: string;
          author_name: string;
          author_role: string | null;
          content: string;
          is_visible: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          author_name: string;
          author_role?: string | null;
          content: string;
          is_visible?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          author_name?: string;
          author_role?: string | null;
          content?: string;
          is_visible?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
      instructors: {
        Row: {
          id: string;
          created_at: string;
          name: string;
          title: string | null;
          bio: string | null;
          photo_url: string | null;
          type: 'judge' | 'masterclass';
          is_visible: boolean;
          display_order: number;
        };
        Insert: {
          id?: string;
          created_at?: string;
          name: string;
          title?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          type: 'judge' | 'masterclass';
          is_visible?: boolean;
          display_order?: number;
        };
        Update: {
          id?: string;
          created_at?: string;
          name?: string;
          title?: string | null;
          bio?: string | null;
          photo_url?: string | null;
          type?: 'judge' | 'masterclass';
          is_visible?: boolean;
          display_order?: number;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      contact_submissions: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string | null;
          subject: string | null;
          message: string;
          submitted_at: string | null;
          read: boolean | null;
          replied: boolean | null;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone?: string | null;
          subject?: string | null;
          message: string;
          submitted_at?: string | null;
          read?: boolean | null;
          replied?: boolean | null;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          subject?: string | null;
          message?: string;
          submitted_at?: string | null;
          read?: boolean | null;
          replied?: boolean | null;
        };
        Relationships: [];
      };
      mailing_list: {
        Row: {
          id: string;
          email: string;
          name: string | null;
          source: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email: string;
          name?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string | null;
          source?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      site_content: {
        Row: {
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      products: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price: number;
          category: string | null;
          sizes_available: string[] | null;
          image_url: string | null;
          image_urls: string[] | null;
          is_available: boolean;
          is_visible: boolean;
          display_order: number;
          stock_note: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          price: number;
          category?: string | null;
          sizes_available?: string[] | null;
          image_url?: string | null;
          image_urls?: string[] | null;
          is_available?: boolean;
          is_visible?: boolean;
          display_order?: number;
          stock_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          price?: number;
          category?: string | null;
          sizes_available?: string[] | null;
          image_url?: string | null;
          image_urls?: string[] | null;
          is_available?: boolean;
          is_visible?: boolean;
          display_order?: number;
          stock_note?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      orders: {
        Row: {
          id: string;
          customer_name: string;
          customer_email: string;
          items: Json;
          total_amount: number;
          status: string;
          payment_reference: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          customer_name: string;
          customer_email: string;
          items: Json;
          total_amount: number;
          status?: string;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          customer_name?: string;
          customer_email?: string;
          items?: Json;
          total_amount?: number;
          status?: string;
          payment_reference?: string | null;
          notes?: string | null;
          created_at?: string;
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
