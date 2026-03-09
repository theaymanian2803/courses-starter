export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      bundle_courses: {
        Row: {
          bundle_id: string
          course_id: string
          id: string
        }
        Insert: {
          bundle_id: string
          course_id: string
          id?: string
        }
        Update: {
          bundle_id?: string
          course_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bundle_courses_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bundle_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      bundles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          price: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          price?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      comment_notifications: {
        Row: {
          comment_id: string
          created_at: string
          id: string
          is_read: boolean
          reply_id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          reply_id: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          reply_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_notifications_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "lesson_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comment_notifications_reply_id_fkey"
            columns: ["reply_id"]
            isOneToOne: false
            referencedRelation: "lesson_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_percent: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_percent: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_percent?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
        }
        Relationships: []
      }
      courses: {
        Row: {
          created_at: string
          description: string | null
          id: string
          price: number
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          price?: number
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          price?: number
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      hero_settings: {
        Row: {
          background_image_url: string | null
          badge_text: string
          cta_primary_text: string
          cta_secondary_text: string
          heading_highlight: string
          heading_line1: string
          heading_line3: string
          id: string
          overlay_image_url: string | null
          overlay_inset: number | null
          overlay_opacity: number
          stat1_label: string
          stat1_value: string
          stat2_label: string
          stat2_value: string
          stat3_label: string
          stat3_value: string
          stat4_label: string
          stat4_value: string
          subheading: string
          updated_at: string
        }
        Insert: {
          background_image_url?: string | null
          badge_text?: string
          cta_primary_text?: string
          cta_secondary_text?: string
          heading_highlight?: string
          heading_line1?: string
          heading_line3?: string
          id?: string
          overlay_image_url?: string | null
          overlay_inset?: number | null
          overlay_opacity?: number
          stat1_label?: string
          stat1_value?: string
          stat2_label?: string
          stat2_value?: string
          stat3_label?: string
          stat3_value?: string
          stat4_label?: string
          stat4_value?: string
          subheading?: string
          updated_at?: string
        }
        Update: {
          background_image_url?: string | null
          badge_text?: string
          cta_primary_text?: string
          cta_secondary_text?: string
          heading_highlight?: string
          heading_line1?: string
          heading_line3?: string
          id?: string
          overlay_image_url?: string | null
          overlay_inset?: number | null
          overlay_opacity?: number
          stat1_label?: string
          stat1_value?: string
          stat2_label?: string
          stat2_value?: string
          stat3_label?: string
          stat3_value?: string
          stat4_label?: string
          stat4_value?: string
          subheading?: string
          updated_at?: string
        }
        Relationships: []
      }
      instructors: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          github_url: string | null
          id: string
          is_active: boolean
          linkedin_url: string | null
          name: string
          sort_order: number
          specialties: Json
          title: string
          twitter_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio: string
          created_at?: string
          github_url?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name: string
          sort_order?: number
          specialties?: Json
          title: string
          twitter_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          github_url?: string | null
          id?: string
          is_active?: boolean
          linkedin_url?: string | null
          name?: string
          sort_order?: number
          specialties?: Json
          title?: string
          twitter_url?: string | null
        }
        Relationships: []
      }
      landing_page_sections: {
        Row: {
          id: string
          is_visible: boolean
          section_key: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          id?: string
          is_visible?: boolean
          section_key: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          id?: string
          is_visible?: boolean
          section_key?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      lesson_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          lesson_id: string
          parent_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          lesson_id: string
          parent_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          lesson_id?: string
          parent_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_comments_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "lesson_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "lesson_comments"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          completed: boolean
          completed_at: string | null
          id: string
          lesson_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id: string
          user_id: string
        }
        Update: {
          completed?: boolean
          completed_at?: string | null
          id?: string
          lesson_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      lessons: {
        Row: {
          created_at: string
          duration: string | null
          id: string
          is_free_preview: boolean
          module_id: string
          order_index: number
          title: string
          youtube_video_id: string
        }
        Insert: {
          created_at?: string
          duration?: string | null
          id?: string
          is_free_preview?: boolean
          module_id: string
          order_index?: number
          title: string
          youtube_video_id: string
        }
        Update: {
          created_at?: string
          duration?: string | null
          id?: string
          is_free_preview?: boolean
          module_id?: string
          order_index?: number
          title?: string
          youtube_video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lessons_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "modules"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          course_id: string
          created_at: string
          id: string
          order_index: number
          title: string
        }
        Insert: {
          course_id: string
          created_at?: string
          id?: string
          order_index?: number
          title: string
        }
        Update: {
          course_id?: string
          created_at?: string
          id?: string
          order_index?: number
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "modules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      purchases: {
        Row: {
          course_id: string
          id: string
          purchased_at: string
          user_id: string
        }
        Insert: {
          course_id: string
          id?: string
          purchased_at?: string
          user_id: string
        }
        Update: {
          course_id?: string
          id?: string
          purchased_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          brand_highlight: string
          brand_name: string
          copyright_text: string
          favicon_url: string | null
          footer_description: string
          id: string
          logo_url: string | null
          promo_cta_link: string
          promo_cta_text: string
          promo_description: string
          promo_title: string
          updated_at: string
        }
        Insert: {
          brand_highlight?: string
          brand_name?: string
          copyright_text?: string
          favicon_url?: string | null
          footer_description?: string
          id?: string
          logo_url?: string | null
          promo_cta_link?: string
          promo_cta_text?: string
          promo_description?: string
          promo_title?: string
          updated_at?: string
        }
        Update: {
          brand_highlight?: string
          brand_name?: string
          copyright_text?: string
          favicon_url?: string | null
          footer_description?: string
          id?: string
          logo_url?: string | null
          promo_cta_link?: string
          promo_cta_text?: string
          promo_description?: string
          promo_title?: string
          updated_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          github_url: string | null
          id: string
          instagram_url: string | null
          linkedin_url: string | null
          twitter_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          github_url?: string | null
          id?: string
          instagram_url?: string | null
          linkedin_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: []
      }
      subscription_tiers: {
        Row: {
          created_at: string
          description: string | null
          features: Json
          id: string
          is_active: boolean
          monthly_price: number
          name: string
          slug: string
          sort_order: number
          yearly_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price?: number
          name: string
          slug: string
          sort_order?: number
          yearly_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          features?: Json
          id?: string
          is_active?: boolean
          monthly_price?: number
          name?: string
          slug?: string
          sort_order?: number
          yearly_price?: number
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          created_at: string
          id: string
          initials: string
          is_active: boolean
          name: string
          rating: number
          role: string
          sort_order: number
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          initials: string
          is_active?: boolean
          name: string
          rating?: number
          role: string
          sort_order?: number
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          initials?: string
          is_active?: boolean
          name?: string
          rating?: number
          role?: string
          sort_order?: number
          text?: string
        }
        Relationships: []
      }
      tier_courses: {
        Row: {
          course_id: string
          id: string
          tier_id: string
        }
        Insert: {
          course_id: string
          id?: string
          tier_id: string
        }
        Update: {
          course_id?: string
          id?: string
          tier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tier_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tier_courses_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      upsell_offers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          offer_type: string
          price: number
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          offer_type?: string
          price?: number
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          offer_type?: string
          price?: number
          title?: string
        }
        Relationships: []
      }
      upsell_purchases: {
        Row: {
          id: string
          purchased_at: string
          upsell_offer_id: string
          user_id: string
        }
        Insert: {
          id?: string
          purchased_at?: string
          upsell_offer_id: string
          user_id: string
        }
        Update: {
          id?: string
          purchased_at?: string
          upsell_offer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "upsell_purchases_upsell_offer_id_fkey"
            columns: ["upsell_offer_id"]
            isOneToOne: false
            referencedRelation: "upsell_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_cycle: string
          created_at: string
          ends_at: string | null
          id: string
          starts_at: string
          status: string
          tier_id: string
          user_id: string
        }
        Insert: {
          billing_cycle?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          starts_at?: string
          status?: string
          tier_id: string
          user_id: string
        }
        Update: {
          billing_cycle?: string
          created_at?: string
          ends_at?: string | null
          id?: string
          starts_at?: string
          status?: string
          tier_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "subscription_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_emails: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_coupon_usage: { Args: { _code: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
