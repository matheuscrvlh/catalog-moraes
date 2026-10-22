
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity": string,"entity_id": string | null,"id": number,"summary": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity": string,"entity_id"?: string | null,"id"?: never,"summary"?: string | null
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity"?: string,"entity_id"?: string | null,"id"?: never,"summary"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "customer_summaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "audit_logs_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"banners": {
                  Row: {
                    "active": boolean,"created_at": string,"cta_href": string | null,"cta_label": string | null,"ends_at": string | null,"eyebrow": string | null,"id": string,"image_path": string | null,"position": number,"starts_at": string | null,"subtitle": string | null,"theme": string,"title": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"cta_href"?: string | null,"cta_label"?: string | null,"ends_at"?: string | null,"eyebrow"?: string | null,"id"?: string,"image_path"?: string | null,"position"?: number,"starts_at"?: string | null,"subtitle"?: string | null,"theme"?: string,"title": string,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"cta_href"?: string | null,"cta_label"?: string | null,"ends_at"?: string | null,"eyebrow"?: string | null,"id"?: string,"image_path"?: string | null,"position"?: number,"starts_at"?: string | null,"subtitle"?: string | null,"theme"?: string,"title"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"categories": {
                  Row: {
                    "accent": string,"active": boolean,"created_at": string,"description": string | null,"id": string,"image_path": string | null,"name": string,"position": number,"slug": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "accent"?: string,"active"?: boolean,"created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"name": string,"position"?: number,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "accent"?: string,"active"?: boolean,"created_at"?: string,"description"?: string | null,"id"?: string,"image_path"?: string | null,"name"?: string,"position"?: number,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"favorites": {
                  Row: {
                    "created_at": string,"product_id": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"product_id": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"product_id"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "favorites_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "customer_summaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "favorites_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"order_events": {
                  Row: {
                    "author_id": string | null,"body": string | null,"created_at": string,"from_status": Database["public"]['Enums']["order_status"] | null,"id": string,"kind": Database["public"]['Enums']["order_event_kind"],"order_id": string,"to_status": Database["public"]['Enums']["order_status"] | null
                  }
                  ComputedFields: never
                  Insert: {
                    "author_id"?: string | null,"body"?: string | null,"created_at"?: string,"from_status"?: Database["public"]['Enums']["order_status"] | null,"id"?: string,"kind": Database["public"]['Enums']["order_event_kind"],"order_id": string,"to_status"?: Database["public"]['Enums']["order_status"] | null
                  }
                  Update: {
                    "author_id"?: string | null,"body"?: string | null,"created_at"?: string,"from_status"?: Database["public"]['Enums']["order_status"] | null,"id"?: string,"kind"?: Database["public"]['Enums']["order_event_kind"],"order_id"?: string,"to_status"?: Database["public"]['Enums']["order_status"] | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_events_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "customer_summaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_events_author_id_fkey"
      columns: ["author_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_events_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"order_files": {
                  Row: {
                    "created_at": string,"event_id": string,"id": string,"mime_type": string,"name": string,"order_id": string,"path": string,"size_bytes": number
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"event_id": string,"id"?: string,"mime_type": string,"name": string,"order_id": string,"path": string,"size_bytes": number
                  }
                  Update: {
                    "created_at"?: string,"event_id"?: string,"id"?: string,"mime_type"?: string,"name"?: string,"order_id"?: string,"path"?: string,"size_bytes"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_files_event_id_fkey"
      columns: ["event_id"]
isOneToOne: false
      referencedRelation: "order_events"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_files_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    }
                  ]
                },"order_items": {
                  Row: {
                    "id": string,"line_total": number | null,"order_id": string,"product_id": string | null,"product_name": string,"quantity": number,"unit_price": number | null,"variant_id": string | null,"variant_label": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"line_total"?: never,"order_id": string,"product_id"?: string | null,"product_name": string,"quantity": number,"unit_price"?: number | null,"variant_id"?: string | null,"variant_label": string
                  }
                  Update: {
                    "id"?: string,"line_total"?: never,"order_id"?: string,"product_id"?: string | null,"product_name"?: string,"quantity"?: number,"unit_price"?: number | null,"variant_id"?: string | null,"variant_label"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "order_items_order_id_fkey"
      columns: ["order_id"]
isOneToOne: false
      referencedRelation: "orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["default_variant_id"]
    },{
      foreignKeyName: "order_items_variant_id_fkey"
      columns: ["variant_id"]
isOneToOne: false
      referencedRelation: "product_variants"
      referencedColumns: ["id"]
    }
                  ]
                },"orders": {
                  Row: {
                    "created_at": string,"created_by": string | null,"customer_company": string | null,"customer_id": string | null,"customer_name": string,"customer_phone": string | null,"handled_by": string | null,"id": string,"internal_notes": string | null,"notes": string | null,"number": number,"status": Database["public"]['Enums']["order_status"],"subtotal": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"created_by"?: string | null,"customer_company"?: string | null,"customer_id"?: string | null,"customer_name": string,"customer_phone"?: string | null,"handled_by"?: string | null,"id"?: string,"internal_notes"?: string | null,"notes"?: string | null,"number"?: never,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"created_by"?: string | null,"customer_company"?: string | null,"customer_id"?: string | null,"customer_name"?: string,"customer_phone"?: string | null,"handled_by"?: string | null,"id"?: string,"internal_notes"?: string | null,"notes"?: string | null,"number"?: never,"status"?: Database["public"]['Enums']["order_status"],"subtotal"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "orders_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "customer_summaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "customer_summaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_customer_id_fkey"
      columns: ["customer_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "customer_summaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "orders_handled_by_fkey"
      columns: ["handled_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"producers": {
                  Row: {
                    "active": boolean,"country": string | null,"created_at": string,"description": string | null,"id": string,"name": string,"region": string | null,"slug": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"country"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"name": string,"region"?: string | null,"slug": string,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"country"?: string | null,"created_at"?: string,"description"?: string | null,"id"?: string,"name"?: string,"region"?: string | null,"slug"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"product_images": {
                  Row: {
                    "alt": string | null,"created_at": string,"id": string,"path": string,"position": number,"product_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "alt"?: string | null,"created_at"?: string,"id"?: string,"path": string,"position"?: number,"product_id": string
                  }
                  Update: {
                    "alt"?: string | null,"created_at"?: string,"id"?: string,"path"?: string,"position"?: number,"product_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_images_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_variants": {
                  Row: {
                    "active": boolean,"created_at": string,"id": string,"label": string,"position": number,"price": number | null,"product_id": string,"promo_price": number | null,"sku": string | null,"stock": number,"updated_at": string,"volume_ml": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"created_at"?: string,"id"?: string,"label": string,"position"?: number,"price"?: number | null,"product_id": string,"promo_price"?: number | null,"sku"?: string | null,"stock"?: number,"updated_at"?: string,"volume_ml"?: number | null
                  }
                  Update: {
                    "active"?: boolean,"created_at"?: string,"id"?: string,"label"?: string,"position"?: number,"price"?: number | null,"product_id"?: string,"promo_price"?: number | null,"sku"?: string | null,"stock"?: number,"updated_at"?: string,"volume_ml"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_variants_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"product_views": {
                  Row: {
                    "day": string,"product_id": string,"views": number
                  }
                  ComputedFields: never
                  Insert: {
                    "day"?: string,"product_id": string,"views"?: number
                  }
                  Update: {
                    "day"?: string,"product_id"?: string,"views"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "product_views_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "product_views_product_id_fkey"
      columns: ["product_id"]
isOneToOne: false
      referencedRelation: "products"
      referencedColumns: ["id"]
    }
                  ]
                },"products": {
                  Row: {
                    "acidity": number | null,"active": boolean,"alcohol": number | null,"aroma_notes": string | null,"badge": string | null,"body": number | null,"category_id": string,"country": string | null,"created_at": string,"created_by": string | null,"description": string | null,"featured": boolean,"grapes": (string)[],"id": string,"name": string,"pairing": (string)[],"palate_notes": string | null,"producer_id": string | null,"region": string | null,"search_text": string,"serving_temp": string | null,"slug": string,"sweetness": Database["public"]['Enums']["wine_sweetness"] | null,"sweetness_level": number | null,"tagline": string | null,"tannin": number | null,"updated_at": string,"vintage": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "acidity"?: number | null,"active"?: boolean,"alcohol"?: number | null,"aroma_notes"?: string | null,"badge"?: string | null,"body"?: number | null,"category_id": string,"country"?: string | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"featured"?: boolean,"grapes"?: (string)[],"id"?: string,"name": string,"pairing"?: (string)[],"palate_notes"?: string | null,"producer_id"?: string | null,"region"?: string | null,"search_text"?: string,"serving_temp"?: string | null,"slug": string,"sweetness"?: Database["public"]['Enums']["wine_sweetness"] | null,"sweetness_level"?: number | null,"tagline"?: string | null,"tannin"?: number | null,"updated_at"?: string,"vintage"?: number | null
                  }
                  Update: {
                    "acidity"?: number | null,"active"?: boolean,"alcohol"?: number | null,"aroma_notes"?: string | null,"badge"?: string | null,"body"?: number | null,"category_id"?: string,"country"?: string | null,"created_at"?: string,"created_by"?: string | null,"description"?: string | null,"featured"?: boolean,"grapes"?: (string)[],"id"?: string,"name"?: string,"pairing"?: (string)[],"palate_notes"?: string | null,"producer_id"?: string | null,"region"?: string | null,"search_text"?: string,"serving_temp"?: string | null,"slug"?: string,"sweetness"?: Database["public"]['Enums']["wine_sweetness"] | null,"sweetness_level"?: number | null,"tagline"?: string | null,"tannin"?: number | null,"updated_at"?: string,"vintage"?: number | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["category_id"]
    },{
      foreignKeyName: "products_category_id_fkey"
      columns: ["category_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "products_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "customer_summaries"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "products_created_by_fkey"
      columns: ["created_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "products_producer_id_fkey"
      columns: ["producer_id"]
isOneToOne: false
      referencedRelation: "catalog_products"
      referencedColumns: ["producer_id"]
    },{
      foreignKeyName: "products_producer_id_fkey"
      columns: ["producer_id"]
isOneToOne: false
      referencedRelation: "producers"
      referencedColumns: ["id"]
    }
                  ]
                },"profiles": {
                  Row: {
                    "active": boolean,"avatar_url": string | null,"business_type": Database["public"]['Enums']["business_type"] | null,"company_name": string | null,"created_at": string,"email": string,"full_name": string,"id": string,"phone": string | null,"role_id": string | null,"tax_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "active"?: boolean,"avatar_url"?: string | null,"business_type"?: Database["public"]['Enums']["business_type"] | null,"company_name"?: string | null,"created_at"?: string,"email": string,"full_name"?: string,"id": string,"phone"?: string | null,"role_id"?: string | null,"tax_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "active"?: boolean,"avatar_url"?: string | null,"business_type"?: Database["public"]['Enums']["business_type"] | null,"company_name"?: string | null,"created_at"?: string,"email"?: string,"full_name"?: string,"id"?: string,"phone"?: string | null,"role_id"?: string | null,"tax_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_role_id_fkey"
      columns: ["role_id"]
isOneToOne: false
      referencedRelation: "roles"
      referencedColumns: ["id"]
    }
                  ]
                },"roles": {
                  Row: {
                    "created_at": string,"description": string | null,"id": string,"is_system": boolean,"name": string,"permissions": (string)[],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_system"?: boolean,"name": string,"permissions"?: (string)[],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"description"?: string | null,"id"?: string,"is_system"?: boolean,"name"?: string,"permissions"?: (string)[],"updated_at"?: string
                  }
                  Relationships: [
                    
                  ]
                },"store_settings": {
                  Row: {
                    "about": string | null,"address": string | null,"email": string | null,"id": number,"instagram": string | null,"phone": string | null,"show_prices": boolean,"store_name": string,"updated_at": string,"whatsapp": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "about"?: string | null,"address"?: string | null,"email"?: string | null,"id"?: number,"instagram"?: string | null,"phone"?: string | null,"show_prices"?: boolean,"store_name"?: string,"updated_at"?: string,"whatsapp"?: string | null
                  }
                  Update: {
                    "about"?: string | null,"address"?: string | null,"email"?: string | null,"id"?: number,"instagram"?: string | null,"phone"?: string | null,"show_prices"?: boolean,"store_name"?: string,"updated_at"?: string,"whatsapp"?: string | null
                  }
                  Relationships: [
                    
                  ]
                }
          }
          Views: {
            "catalog_products": {
                  Row: {
                    "active": boolean | null,"badge": string | null,"category_accent": string | null,"category_id": string | null,"category_name": string | null,"category_slug": string | null,"country": string | null,"created_at": string | null,"default_variant_id": string | null,"default_variant_label": string | null,"default_variant_price": number | null,"featured": boolean | null,"grapes": (string)[] | null,"id": string | null,"image_path": string | null,"min_price": number | null,"min_regular_price": number | null,"name": string | null,"producer_id": string | null,"producer_name": string | null,"producer_slug": string | null,"region": string | null,"search_text": string | null,"slug": string | null,"sweetness": Database["public"]['Enums']["wine_sweetness"] | null,"tagline": string | null,"total_stock": number | null,"variant_count": number | null,"vintage": number | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                },"customer_summaries": {
                  Row: {
                    "active": boolean | null,"business_type": Database["public"]['Enums']["business_type"] | null,"company_name": string | null,"created_at": string | null,"email": string | null,"full_name": string | null,"id": string | null,"last_order_at": string | null,"orders": number | null,"phone": string | null,"spent": number | null,"tax_id": string | null
                  }
                  ComputedFields: never
                  Relationships: [
                    
                  ]
                }
          }
          Functions: {
            "admin_adjust_stock":
{ Args: { "quantity": number,"variant": string }; Returns: number
                           },
"admin_create_order":
{ Args: { "customer": string,"items": Json,"notes"?: string }; Returns: {
              "order_id": string,"order_number": number
            }[]
                           },
"admin_save_product":
{ Args: { "payload": Json }; Returns: string
                           },
"admin_update_member":
{ Args: { "is_active": boolean,"new_role": string,"target": string }; Returns: undefined
                           },
"dashboard_metrics":
{ Args: { "period_days"?: number }; Returns: Json
                           },
"fill_order_items":
{ Args: { "items": Json,"target": string }; Returns: number
                           },
"has_permission":
{ Args: { "permission": string }; Returns: boolean
                           },
"immutable_unaccent":
{ Args: { "": string }; Returns: string
                           },
"is_staff":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"local_today":
{ Args: Record<PropertyKey, never>; Returns: string
                           },
"place_order":
{ Args: { "items": Json,"notes"?: string }; Returns: {
              "order_id": string,"order_number": number
            }[]
                           },
"track_product_view":
{ Args: { "product": string }; Returns: undefined
                           }
          }
          Enums: {
            "business_type": "adega"|"mercado"|"vinicola"|"restaurante"|"distribuidor"|"outro","order_event_kind": "created"|"status"|"comment","order_status": "novo"|"confirmado"|"em_rota"|"entregue"|"cancelado","wine_sweetness": "seco"|"meio_seco"|"suave"|"doce"|"brut"|"extra_brut"|"demi_sec"|"nature"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
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
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "business_type": ["adega", "mercado", "vinicola", "restaurante", "distribuidor", "outro"],"order_event_kind": ["created", "status", "comment"],"order_status": ["novo", "confirmado", "em_rota", "entregue", "cancelado"],"wine_sweetness": ["seco", "meio_seco", "suave", "doce", "brut", "extra_brut", "demi_sec", "nature"]
          }
        }
} as const
