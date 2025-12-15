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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      custodial_wallets: {
        Row: {
          created_at: string | null
          encrypted_private_key: string
          id: string
          network: string
          user_id: string
          wallet_address: string
        }
        Insert: {
          created_at?: string | null
          encrypted_private_key: string
          id?: string
          network?: string
          user_id: string
          wallet_address: string
        }
        Update: {
          created_at?: string | null
          encrypted_private_key?: string
          id?: string
          network?: string
          user_id?: string
          wallet_address?: string
        }
        Relationships: []
      }
      earnings: {
        Row: {
          amount: number
          claimed: boolean | null
          created_at: string | null
          film_id: string
          id: string
          source: string
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          claimed?: boolean | null
          created_at?: string | null
          film_id: string
          id?: string
          source: string
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          claimed?: boolean | null
          created_at?: string | null
          film_id?: string
          id?: string
          source?: string
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "earnings_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
        ]
      }
      films: {
        Row: {
          available_shares: number | null
          created_at: string | null
          creator_id: string
          creator_revenue_share: number | null
          description: string | null
          direct_price: number | null
          director: string | null
          duration_minutes: number | null
          film_url: string | null
          genre: string | null
          id: string
          investment_price_per_share: number | null
          investor_revenue_share: number | null
          nft_price: number | null
          platform_fee: number | null
          poster_url: string | null
          rating: number | null
          release_year: number | null
          status: Database["public"]["Enums"]["film_status"] | null
          title: string
          total_earnings: number | null
          total_shares: number | null
          trailer_url: string | null
          updated_at: string | null
          views: number | null
        }
        Insert: {
          available_shares?: number | null
          created_at?: string | null
          creator_id: string
          creator_revenue_share?: number | null
          description?: string | null
          direct_price?: number | null
          director?: string | null
          duration_minutes?: number | null
          film_url?: string | null
          genre?: string | null
          id?: string
          investment_price_per_share?: number | null
          investor_revenue_share?: number | null
          nft_price?: number | null
          platform_fee?: number | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          status?: Database["public"]["Enums"]["film_status"] | null
          title: string
          total_earnings?: number | null
          total_shares?: number | null
          trailer_url?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          available_shares?: number | null
          created_at?: string | null
          creator_id?: string
          creator_revenue_share?: number | null
          description?: string | null
          direct_price?: number | null
          director?: string | null
          duration_minutes?: number | null
          film_url?: string | null
          genre?: string | null
          id?: string
          investment_price_per_share?: number | null
          investor_revenue_share?: number | null
          nft_price?: number | null
          platform_fee?: number | null
          poster_url?: string | null
          rating?: number | null
          release_year?: number | null
          status?: Database["public"]["Enums"]["film_status"] | null
          title?: string
          total_earnings?: number | null
          total_shares?: number | null
          trailer_url?: string | null
          updated_at?: string | null
          views?: number | null
        }
        Relationships: []
      }
      investments: {
        Row: {
          amount_invested: number
          created_at: string | null
          earnings_claimed: number | null
          film_id: string
          id: string
          investor_id: string
          shares_owned: number
          tx_hash: string | null
        }
        Insert: {
          amount_invested: number
          created_at?: string | null
          earnings_claimed?: number | null
          film_id: string
          id?: string
          investor_id: string
          shares_owned: number
          tx_hash?: string | null
        }
        Update: {
          amount_invested?: number
          created_at?: string | null
          earnings_claimed?: number | null
          film_id?: string
          id?: string
          investor_id?: string
          shares_owned?: number
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      purchases: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          film_id: string
          id: string
          network: string
          purchase_type: Database["public"]["Enums"]["purchase_type"]
          tx_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          film_id: string
          id?: string
          network: string
          purchase_type: Database["public"]["Enums"]["purchase_type"]
          tx_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          film_id?: string
          id?: string
          network?: string
          purchase_type?: Database["public"]["Enums"]["purchase_type"]
          tx_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "purchases_film_id_fkey"
            columns: ["film_id"]
            isOneToOne: false
            referencedRelation: "films"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      safe_wallet_view: {
        Row: {
          created_at: string | null
          id: string | null
          network: string | null
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          network?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          network?: string | null
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_wallet_info: {
        Args: { p_network?: string; p_user_id: string }
        Returns: {
          created_at: string
          id: string
          network: string
          wallet_address: string
        }[]
      }
    }
    Enums: {
      film_status: "draft" | "pending" | "approved" | "rejected"
      purchase_type: "nft" | "direct" | "investment"
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
      film_status: ["draft", "pending", "approved", "rejected"],
      purchase_type: ["nft", "direct", "investment"],
    },
  },
} as const
