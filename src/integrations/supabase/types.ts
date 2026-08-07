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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      applications: {
        Row: {
          applicant_name: string
          city: string
          company: string
          country: string
          created_at: string
          id: string
          kyc_verified: boolean
          payment_verified: boolean
          reviewer: string | null
          stage: string
          state: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          applicant_name: string
          city?: string
          company?: string
          country?: string
          created_at?: string
          id?: string
          kyc_verified?: boolean
          payment_verified?: boolean
          reviewer?: string | null
          stage?: string
          state?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          applicant_name?: string
          city?: string
          company?: string
          country?: string
          created_at?: string
          id?: string
          kyc_verified?: boolean
          payment_verified?: boolean
          reviewer?: string | null
          stage?: string
          state?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          action: string
          actor: string
          at: string
          id: string
          meta: string | null
          scope: string
          target: string
        }
        Insert: {
          action: string
          actor?: string
          at?: string
          id?: string
          meta?: string | null
          scope?: string
          target?: string
        }
        Update: {
          action?: string
          actor?: string
          at?: string
          id?: string
          meta?: string | null
          scope?: string
          target?: string
        }
        Relationships: []
      }
      commission_rules: {
        Row: {
          active: boolean
          basis: string
          created_at: string
          id: string
          min_payout: number
          name: string
          rate_pct: number
          scope: string
          scope_value: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          basis?: string
          created_at?: string
          id?: string
          min_payout?: number
          name: string
          rate_pct?: number
          scope?: string
          scope_value?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          basis?: string
          created_at?: string
          id?: string
          min_payout?: number
          name?: string
          rate_pct?: number
          scope?: string
          scope_value?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          adjustment: number
          approver: string | null
          base: number
          created_at: string
          cycle: string
          franchise: string
          franchise_id: string | null
          id: string
          payable: number
          rate_pct: number
          status: string
          tax: number
          updated_at: string
        }
        Insert: {
          adjustment?: number
          approver?: string | null
          base?: number
          created_at?: string
          cycle: string
          franchise?: string
          franchise_id?: string | null
          id?: string
          payable?: number
          rate_pct?: number
          status?: string
          tax?: number
          updated_at?: string
        }
        Update: {
          adjustment?: number
          approver?: string | null
          base?: number
          created_at?: string
          cycle?: string
          franchise?: string
          franchise_id?: string | null
          id?: string
          payable?: number
          rate_pct?: number
          status?: string
          tax?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          category: string
          created_at: string
          franchise: string | null
          id: string
          kind: string
          name: string
          scope: string
          size: number
          status: string
          target_id: string
          target_label: string
          uploaded_at: string
        }
        Insert: {
          category?: string
          created_at?: string
          franchise?: string | null
          id?: string
          kind?: string
          name: string
          scope?: string
          size?: number
          status?: string
          target_id?: string
          target_label?: string
          uploaded_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          franchise?: string | null
          id?: string
          kind?: string
          name?: string
          scope?: string
          size?: number
          status?: string
          target_id?: string
          target_label?: string
          uploaded_at?: string
        }
        Relationships: []
      }
      franchises: {
        Row: {
          city: string
          code: string
          commission_pct: number
          company: string
          country: string
          created_at: string
          health_score: number
          id: string
          licenses: number
          owner: string
          products_assigned: number
          revenue_mtd: number
          risk_level: string
          state: string
          status: string
          tier: string
          updated_at: string
        }
        Insert: {
          city?: string
          code: string
          commission_pct?: number
          company: string
          country?: string
          created_at?: string
          health_score?: number
          id?: string
          licenses?: number
          owner: string
          products_assigned?: number
          revenue_mtd?: number
          risk_level?: string
          state?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Update: {
          city?: string
          code?: string
          commission_pct?: number
          company?: string
          country?: string
          created_at?: string
          health_score?: number
          id?: string
          licenses?: number
          owner?: string
          products_assigned?: number
          revenue_mtd?: number
          risk_level?: string
          state?: string
          status?: string
          tier?: string
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          country: string
          created_at: string
          due_at: string
          franchise: string
          franchise_id: string | null
          id: string
          issued_at: string
          number: string
          status: string
          tax: number
          type: string
          updated_at: string
        }
        Insert: {
          amount?: number
          country?: string
          created_at?: string
          due_at?: string
          franchise?: string
          franchise_id?: string | null
          id?: string
          issued_at?: string
          number: string
          status?: string
          tax?: number
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          country?: string
          created_at?: string
          due_at?: string
          franchise?: string
          franchise_id?: string | null
          id?: string
          issued_at?: string
          number?: string
          status?: string
          tax?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string
          country: string
          created_at: string
          id: string
          name: string
          next_action: string | null
          owner: string | null
          score: number
          source: string
          stage: string
          updated_at: string
        }
        Insert: {
          company?: string
          country?: string
          created_at?: string
          id?: string
          name: string
          next_action?: string | null
          owner?: string | null
          score?: number
          source?: string
          stage?: string
          updated_at?: string
        }
        Update: {
          company?: string
          country?: string
          created_at?: string
          id?: string
          name?: string
          next_action?: string | null
          owner?: string | null
          score?: number
          source?: string
          stage?: string
          updated_at?: string
        }
        Relationships: []
      }
      licenses: {
        Row: {
          compliance_cleared: boolean
          created_at: string
          devices: number
          devices_max: number
          domains: number
          domains_max: number
          expires_at: string
          franchise: string
          franchise_id: string | null
          id: string
          issued_at: string
          key: string
          kyc_verified: boolean
          plan: string
          status: string
          updated_at: string
        }
        Insert: {
          compliance_cleared?: boolean
          created_at?: string
          devices?: number
          devices_max?: number
          domains?: number
          domains_max?: number
          expires_at?: string
          franchise?: string
          franchise_id?: string | null
          id?: string
          issued_at?: string
          key: string
          kyc_verified?: boolean
          plan?: string
          status?: string
          updated_at?: string
        }
        Update: {
          compliance_cleared?: boolean
          created_at?: string
          devices?: number
          devices_max?: number
          domains?: number
          domains_max?: number
          expires_at?: string
          franchise?: string
          franchise_id?: string | null
          id?: string
          issued_at?: string
          key?: string
          kyc_verified?: boolean
          plan?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "licenses_franchise_id_fkey"
            columns: ["franchise_id"]
            isOneToOne: false
            referencedRelation: "franchises"
            referencedColumns: ["id"]
          },
        ]
      }
      territories: {
        Row: {
          assigned_to: string | null
          city: string
          country: string
          created_at: string
          id: string
          locked: boolean
          market_size: number
          population: number
          region: string
          state: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          locked?: boolean
          market_size?: number
          population?: number
          region?: string
          state?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          city?: string
          country?: string
          created_at?: string
          id?: string
          locked?: boolean
          market_size?: number
          population?: number
          region?: string
          state?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
