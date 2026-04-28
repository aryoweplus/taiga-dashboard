export interface TaigaAuthResponse {
  auth_token: string
  id: number
  username: string
  full_name: string
  email: string
}

export interface TaigaUserStory {
  id: number
  ref: number
  subject: string
  status: number
  status_extra_info: {
    name: string
    is_closed: boolean
    color: string
  }
  assigned_to: number | null
  assigned_to_extra_info: {
    id: number
    full_name: string
    full_name_display: string
    username: string
    photo: string | null
  } | null
  assigned_users: number[]
  milestone: number | null
  milestone_slug: string | null
  milestone_name: string | null
  is_closed: boolean           // ✅ ini yang utama
  is_blocked: boolean
  total_points: number | null
  kanban_order: number         // ✅ tambah ini
  swimlane: number | null      // ✅ tambah ini
}

export interface TaigaTask {
  id: number
  ref: number
  subject: string
  status: number
  status_extra_info: {
    name: string
    is_closed: boolean
    color: string
  }
  assigned_to: number | null
  assigned_to_extra_info: {
    id: number
    full_name: string
    username: string
  } | null
  is_blocked: boolean
  user_story: number | null
}

export interface TaigaMember {
  id: number
  user: number
  full_name: string
  username: string
  role: number
  role_name: string
  photo: string | null
}

export interface TaigaMilestone {
  id: number
  name: string
  slug: string
  estimated_start: string
  estimated_finish: string
  closed_points: number
  total_points: number
}

export interface TaigaProjectStats {
  defined_points: number
  assigned_points: number
  closed_points: number
  iocaine_doses: number
  total_milestones: number
  total_userstories: number
  closed_userstories: number
}

export interface SprintSummary {
  total: number
  done: number
  inProgress: number
  blocked: number
  completionPct: number
}

export interface MemberSummary {
  id: number
  full_name: string
  username: string
  role_name: string
  done: number
  inProgress: number
  blocked: number
  total: number
  pct: number
}