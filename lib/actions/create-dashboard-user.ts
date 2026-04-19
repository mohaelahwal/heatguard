'use server'

export interface NewUser {
  id:     string
  name:   string
  email:  string
  role:   'Manager' | 'Supervisor' | 'Medic'
  status: 'Active'
}

export type CreateUserResult =
  | { success: true;  user: NewUser }
  | { success: false; error: string }

export async function createDashboardUser(
  formData: FormData
): Promise<CreateUserResult> {
  const fullName = (formData.get('fullName') as string)?.trim()
  const email    = (formData.get('email')    as string)?.trim()
  const password = (formData.get('password') as string)?.trim()
  const role     = (formData.get('role')     as string)?.trim()
  const entityId = (formData.get('entityId') as string)?.trim()

  if (!fullName || !email || !password || !role || !entityId) {
    return { success: false, error: 'All fields are required.' }
  }

  if (password.length < 8) {
    return { success: false, error: 'Temporary password must be at least 8 characters.' }
  }

  // TODO: Insert into Supabase/DB 'users' table.
  // The main dashboard login screen will authenticate against this table,
  // checking email, password (hashed), and entity_id.
  //
  // const supabase = createServiceClient()
  // const { data: authUser, error } = await supabase.auth.admin.createUser({
  //   email,
  //   password,
  //   user_metadata: { full_name: fullName, role, entity_id: entityId },
  //   email_confirm: true,
  // })
  // if (error) return { success: false, error: error.message }
  //
  // await supabase.from('profiles').insert({
  //   id:        authUser.user.id,
  //   full_name: fullName,
  //   email,
  //   role,
  //   entity_id: entityId,
  // })

  console.log('[createDashboardUser]', { fullName, email, role, entityId })

  const roleLabel = (role.charAt(0).toUpperCase() + role.slice(1)) as NewUser['role']

  return {
    success: true,
    user: {
      id:     `u_${Date.now()}`,
      name:   fullName,
      email,
      role:   roleLabel,
      status: 'Active',
    },
  }
}
