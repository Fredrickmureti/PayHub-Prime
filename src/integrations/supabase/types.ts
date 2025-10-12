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
      merchant_payment_configs: {
        Row: {
          airtel_client_id: string | null
          airtel_client_secret: string | null
          airtel_merchant_code: string | null
          card_api_key: string | null
          card_processor: string | null
          card_secret_key: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_sandbox: boolean | null
          mpesa_account_reference_template: string | null
          mpesa_callback_url: string | null
          mpesa_consumer_key: string | null
          mpesa_consumer_secret: string | null
          mpesa_passkey: string | null
          mpesa_shortcode: string | null
          mpesa_transaction_desc_template: string | null
          payment_method: string
          paypal_client_id: string | null
          paypal_secret: string | null
          project_id: string
          updated_at: string
        }
        Insert: {
          airtel_client_id?: string | null
          airtel_client_secret?: string | null
          airtel_merchant_code?: string | null
          card_api_key?: string | null
          card_processor?: string | null
          card_secret_key?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_sandbox?: boolean | null
          mpesa_account_reference_template?: string | null
          mpesa_callback_url?: string | null
          mpesa_consumer_key?: string | null
          mpesa_consumer_secret?: string | null
          mpesa_passkey?: string | null
          mpesa_shortcode?: string | null
          mpesa_transaction_desc_template?: string | null
          payment_method: string
          paypal_client_id?: string | null
          paypal_secret?: string | null
          project_id: string
          updated_at?: string
        }
        Update: {
          airtel_client_id?: string | null
          airtel_client_secret?: string | null
          airtel_merchant_code?: string | null
          card_api_key?: string | null
          card_processor?: string | null
          card_secret_key?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_sandbox?: boolean | null
          mpesa_account_reference_template?: string | null
          mpesa_callback_url?: string | null
          mpesa_consumer_key?: string | null
          mpesa_consumer_secret?: string | null
          mpesa_passkey?: string | null
          mpesa_shortcode?: string | null
          mpesa_transaction_desc_template?: string | null
          payment_method?: string
          paypal_client_id?: string | null
          paypal_secret?: string | null
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "merchant_payment_configs_merchant_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_links: {
        Row: {
          amount: number | null
          cancel_redirect_url: string | null
          created_at: string
          currency: string
          current_uses: number | null
          description: string | null
          expires_at: string | null
          failure_redirect_url: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          metadata: Json | null
          project_id: string
          success_redirect_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          cancel_redirect_url?: string | null
          created_at?: string
          currency?: string
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          failure_redirect_url?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          project_id: string
          success_redirect_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          cancel_redirect_url?: string | null
          created_at?: string
          currency?: string
          current_uses?: number | null
          description?: string | null
          expires_at?: string | null
          failure_redirect_url?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          metadata?: Json | null
          project_id?: string
          success_redirect_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_links_merchant_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_sessions: {
        Row: {
          amount: number
          callback_url: string | null
          cancel_redirect_url: string | null
          checkout_url: string | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_phone: string | null
          description: string | null
          expires_at: string
          failure_redirect_url: string | null
          id: string
          payment_method: string | null
          project_id: string
          status: string
          success_redirect_url: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          callback_url?: string | null
          cancel_redirect_url?: string | null
          checkout_url?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_phone?: string | null
          description?: string | null
          expires_at?: string
          failure_redirect_url?: string | null
          id?: string
          payment_method?: string | null
          project_id: string
          status?: string
          success_redirect_url?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          callback_url?: string | null
          cancel_redirect_url?: string | null
          checkout_url?: string | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_phone?: string | null
          description?: string | null
          expires_at?: string
          failure_redirect_url?: string | null
          id?: string
          payment_method?: string | null
          project_id?: string
          status?: string
          success_redirect_url?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_sessions_merchant_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      projects: {
        Row: {
          api_key: string | null
          business_email: string | null
          business_name: string
          business_phone: string | null
          created_at: string
          id: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key?: string | null
          business_email?: string | null
          business_name: string
          business_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string | null
          business_email?: string | null
          business_name?: string
          business_phone?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          balance_after: number | null
          balance_before: number | null
          created_at: string
          currency: string
          customer_email: string | null
          customer_name: string | null
          customer_phone: string | null
          description: string | null
          id: string
          metadata: Json | null
          payment_method: string
          project_id: string
          provider_reference: string | null
          receipt_number: string | null
          session_id: string | null
          status: string
          transaction_timestamp: string | null
          updated_at: string
          verification_status: string | null
          webhook_attempts: number | null
          webhook_delivered: boolean | null
          webhook_last_attempt: string | null
        }
        Insert: {
          amount: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method: string
          project_id: string
          provider_reference?: string | null
          receipt_number?: string | null
          session_id?: string | null
          status?: string
          transaction_timestamp?: string | null
          updated_at?: string
          verification_status?: string | null
          webhook_attempts?: number | null
          webhook_delivered?: boolean | null
          webhook_last_attempt?: string | null
        }
        Update: {
          amount?: number
          balance_after?: number | null
          balance_before?: number | null
          created_at?: string
          currency?: string
          customer_email?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          payment_method?: string
          project_id?: string
          provider_reference?: string | null
          receipt_number?: string | null
          session_id?: string | null
          status?: string
          transaction_timestamp?: string | null
          updated_at?: string
          verification_status?: string | null
          webhook_attempts?: number | null
          webhook_delivered?: boolean | null
          webhook_last_attempt?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_merchant_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          attempt_number: number
          created_at: string | null
          error_message: string | null
          id: string
          project_id: string
          request_payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean | null
          transaction_id: string
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          attempt_number?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          project_id: string
          request_payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          transaction_id: string
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          attempt_number?: number
          created_at?: string | null
          error_message?: string | null
          id?: string
          project_id?: string
          request_payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          transaction_id?: string
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_merchant_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "webhook_logs_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      keep_database_active: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
