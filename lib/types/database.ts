// Supabase Database type definition
// Matches the schema in supabase/migrations/001_initial_schema.sql
// NOTE: Each table requires a `Relationships: []` field (Supabase JS SDK v2 requirement)

export type UserRole = 'manager' | 'worker' | 'nurse'
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical'
export type AlertType = 'heat_stress' | 'no_break' | 'symptom_report' | 'sos' | 'custom'
export type WorkerStatusType = 'active' | 'on_break' | 'alert' | 'offline'
export type BreakType = 'water' | 'shade' | 'rest' | 'medical'
export type CallStatus = 'pending' | 'ringing' | 'active' | 'ended' | 'missed' | 'declined'
export type MessageType = 'text' | 'alert' | 'system' | 'broadcast'

export interface Database {
  public: {
    Tables: {
      sites: {
        Row: {
          id: string
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          timezone: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          timezone?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          address?: string | null
          lat?: number | null
          lng?: number | null
          timezone?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          role: UserRole
          full_name: string | null
          avatar_url: string | null
          site_id: string | null
          phone: string | null
          emergency_contact: string | null
          emergency_phone: string | null
          badge_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          site_id?: string | null
          phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          badge_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          role?: UserRole
          full_name?: string | null
          avatar_url?: string | null
          site_id?: string | null
          phone?: string | null
          emergency_contact?: string | null
          emergency_phone?: string | null
          badge_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      worker_status: {
        Row: {
          id: string
          worker_id: string
          status: WorkerStatusType
          lat: number | null
          lng: number | null
          accuracy: number | null
          current_heat_index: number | null
          shift_start: string | null
          last_seen: string
          updated_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          status?: WorkerStatusType
          lat?: number | null
          lng?: number | null
          accuracy?: number | null
          current_heat_index?: number | null
          shift_start?: string | null
          last_seen?: string
          updated_at?: string
        }
        Update: {
          worker_id?: string
          status?: WorkerStatusType
          lat?: number | null
          lng?: number | null
          accuracy?: number | null
          current_heat_index?: number | null
          shift_start?: string | null
          last_seen?: string
          updated_at?: string
        }
        Relationships: []
      }
      heat_readings: {
        Row: {
          id: string
          worker_id: string
          temperature: number
          humidity: number | null
          heat_index: number | null
          lat: number | null
          lng: number | null
          recorded_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          temperature: number
          humidity?: number | null
          heat_index?: number | null
          lat?: number | null
          lng?: number | null
          recorded_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      symptoms: {
        Row: {
          id: string
          worker_id: string
          symptoms: string[]
          severity: number
          notes: string | null
          recorded_at: string
        }
        Insert: {
          id?: string
          worker_id: string
          symptoms: string[]
          severity: number
          notes?: string | null
          recorded_at?: string
        }
        Update: {
          id?: string
        }
        Relationships: []
      }
      breaks: {
        Row: {
          id: string
          worker_id: string
          break_type: BreakType
          started_at: string
          ended_at: string | null
          duration_minutes: number | null
        }
        Insert: {
          id?: string
          worker_id: string
          break_type?: BreakType
          started_at?: string
          ended_at?: string | null
          duration_minutes?: number | null
        }
        Update: {
          ended_at?: string | null
          duration_minutes?: number | null
        }
        Relationships: []
      }
      alerts: {
        Row: {
          id: string
          site_id: string | null
          worker_id: string | null
          created_by: string | null
          type: AlertType
          severity: AlertSeverity
          message: string
          metadata: Record<string, unknown>
          acknowledged_at: string | null
          acknowledged_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          site_id?: string | null
          worker_id?: string | null
          created_by?: string | null
          type: AlertType
          severity?: AlertSeverity
          message: string
          metadata?: Record<string, unknown>
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          created_at?: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          recipient_id: string | null
          site_id: string | null
          content: string
          type: MessageType
          metadata: Record<string, unknown>
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          recipient_id?: string | null
          site_id?: string | null
          content: string
          type?: MessageType
          metadata?: Record<string, unknown>
          read_at?: string | null
          created_at?: string
        }
        Update: {
          read_at?: string | null
        }
        Relationships: []
      }
      video_calls: {
        Row: {
          id: string
          caller_id: string
          callee_id: string
          status: CallStatus
          room_id: string | null
          started_at: string | null
          ended_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          caller_id: string
          callee_id: string
          status?: CallStatus
          room_id?: string | null
          started_at?: string | null
          ended_at?: string | null
          created_at?: string
        }
        Update: {
          status?: CallStatus
          room_id?: string | null
          started_at?: string | null
          ended_at?: string | null
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      current_user_role: {
        Args: Record<string, never>
        Returns: UserRole
      }
      current_user_site: {
        Args: Record<string, never>
        Returns: string
      }
    }
    Enums: {
      user_role: UserRole
      alert_severity: AlertSeverity
      alert_type: AlertType
      worker_status_type: WorkerStatusType
      break_type: BreakType
      call_status: CallStatus
      message_type: MessageType
    }
  }
}

// ============================================================
// Convenience aliases
// ============================================================
export type Site         = Database['public']['Tables']['sites']['Row']
export type Profile      = Database['public']['Tables']['profiles']['Row']
export type WorkerStatus = Database['public']['Tables']['worker_status']['Row']
export type HeatReading  = Database['public']['Tables']['heat_readings']['Row']
export type Symptom      = Database['public']['Tables']['symptoms']['Row']
export type Break        = Database['public']['Tables']['breaks']['Row']
export type Alert        = Database['public']['Tables']['alerts']['Row']
export type Message      = Database['public']['Tables']['messages']['Row']
export type VideoCall    = Database['public']['Tables']['video_calls']['Row']

// ============================================================
// Enriched / joined types (used in API responses)
// ============================================================
export interface WorkerWithStatus extends Profile {
  worker_status: WorkerStatus | null
}

export interface AlertWithWorker extends Alert {
  worker: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'badge_id'> | null
  creator: Pick<Profile, 'id' | 'full_name' | 'role'> | null
}

export interface MessageWithSender extends Message {
  sender: Pick<Profile, 'id' | 'full_name' | 'avatar_url' | 'role'>
}

export interface VideoCallWithParticipants extends VideoCall {
  caller: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
  callee: Pick<Profile, 'id' | 'full_name' | 'avatar_url'>
}
