// lib/studio-auth.ts
import bcrypt from 'bcryptjs'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Use service role for admin operations
)

export interface StudioAuthUser {
  auth_id: string
  organizer_id: string
  email: string
  default_password: boolean
  last_login: string | null
  is_active: boolean
}

export interface StudioData {
  organizer_id: string
  name: string
  description: string
  image_url?: string
  contact_email?: string
  phone?: string
  address?: string
  website_url?: string
  social_media_links?: Record<string, string>
  business_hours?: Record<string, string>
}

export class StudioAuthService {
  // Generate default password for a studio
  static generateDefaultPassword(studioName: string): string {
    const cleanName = studioName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
    const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
    return `${cleanName}2024${randomSuffix}!`
  }

  // Hash password
  static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12)
  }

  // Verify password
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash)
  }

  // Generate reset token
  static generateResetToken(): string {
    return crypto.randomBytes(32).toString('hex')
  }

  // Create studio auth record
  static async createStudioAuth(organizerId: string, email: string, studioName: string) {
    const defaultPassword = this.generateDefaultPassword(studioName)
    const passwordHash = await this.hashPassword(defaultPassword)

    const { data, error } = await supabase
      .from('studioauth')
      .insert({
        organizer_id: organizerId,
        email: email,
        password_hash: passwordHash,
        default_password: true
      })
      .select()
      .single()

    if (error) throw error

    // Return the default password for initial setup
    return { ...data, defaultPassword }
  }

  // Authenticate studio user
  static async authenticateStudio(email: string, password: string): Promise<{
    success: boolean
    user?: StudioAuthUser & { studioData: StudioData }
    error?: string
    requiresPasswordReset?: boolean
  }> {
    try {
      // Check if account is locked
      const { data: authData, error: authError } = await supabase
        .from('studioauth')
        .select(`
          *,
          DiscoveryTabOrganizers (*)
        `)
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (authError || !authData) {
        return { success: false, error: 'Invalid credentials' }
      }

      // Check if account is temporarily locked
      if (authData.locked_until && new Date() < new Date(authData.locked_until)) {
        return { 
          success: false, 
          error: `Account locked until ${new Date(authData.locked_until).toLocaleString()}` 
        }
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(password, authData.password_hash)

      if (!isValidPassword) {
        // Increment login attempts
        const newAttempts = (authData.login_attempts || 0) + 1
        let lockUntil = null

        // Lock account after 5 failed attempts for 30 minutes
        if (newAttempts >= 5) {
          lockUntil = new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
        }

        await supabase
          .from('studioauth')
          .update({ 
            login_attempts: newAttempts,
            locked_until: lockUntil
          })
          .eq('auth_id', authData.auth_id)

        return { success: false, error: 'Invalid credentials' }
      }

      // Reset login attempts and update last login
      await supabase
        .from('studioauth')
        .update({ 
          login_attempts: 0,
          locked_until: null,
          last_login: new Date().toISOString()
        })
        .eq('auth_id', authData.auth_id)

      return {
        success: true,
        user: {
          auth_id: authData.auth_id,
          organizer_id: authData.organizer_id,
          email: authData.email,
          default_password: authData.default_password,
          last_login: authData.last_login,
          is_active: authData.is_active,
          studioData: authData.DiscoveryTabOrganizers
        },
        requiresPasswordReset: authData.default_password
      }

    } catch (error) {
      console.error('Authentication error:', error)
      return { success: false, error: 'Authentication failed' }
    }
  }

  // Change password
  static async changePassword(authId: string, currentPassword: string, newPassword: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { data: authData, error } = await supabase
        .from('studioauth')
        .select('password_hash')
        .eq('auth_id', authId)
        .single()

      if (error || !authData) {
        return { success: false, error: 'User not found' }
      }

      const isValidCurrentPassword = await this.verifyPassword(currentPassword, authData.password_hash)
      if (!isValidCurrentPassword) {
        return { success: false, error: 'Current password is incorrect' }
      }

      const newPasswordHash = await this.hashPassword(newPassword)

      await supabase
        .from('studioauth')
        .update({ 
          password_hash: newPasswordHash,
          default_password: false,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', authId)

      return { success: true }

    } catch (error) {
      console.error('Password change error:', error)
      return { success: false, error: 'Failed to change password' }
    }
  }

  // Request password reset
  static async requestPasswordReset(email: string): Promise<{
    success: boolean
    error?: string
    resetToken?: string
  }> {
    try {
      const { data: authData, error } = await supabase
        .from('studioauth')
        .select('auth_id, email')
        .eq('email', email)
        .eq('is_active', true)
        .single()

      if (error || !authData) {
        // Don't reveal if email exists for security
        return { success: true }
      }

      const resetToken = this.generateResetToken()
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

      // Store reset token
      await supabase
        .from('StudioPasswordResets')
        .insert({
          auth_id: authData.auth_id,
          reset_token: resetToken,
          expires_at: expiresAt.toISOString()
        })

      // Update auth record with reset token
      await supabase
        .from('studioauth')
        .update({
          password_reset_token: resetToken,
          password_reset_expires: expiresAt.toISOString()
        })
        .eq('auth_id', authData.auth_id)

      return { success: true, resetToken }

    } catch (error) {
      console.error('Password reset request error:', error)
      return { success: false, error: 'Failed to process reset request' }
    }
  }

  // Reset password with token
  static async resetPassword(token: string, newPassword: string): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const { data: authData, error } = await supabase
        .from('studioauth')
        .select('auth_id, password_reset_expires')
        .eq('password_reset_token', token)
        .eq('is_active', true)
        .single()

      if (error || !authData) {
        return { success: false, error: 'Invalid or expired reset token' }
      }

      if (new Date() > new Date(authData.password_reset_expires)) {
        return { success: false, error: 'Reset token has expired' }
      }

      const newPasswordHash = await this.hashPassword(newPassword)

      // Update password and clear reset token
      await supabase
        .from('studioauth')
        .update({
          password_hash: newPasswordHash,
          password_reset_token: null,
          password_reset_expires: null,
          default_password: false,
          login_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString()
        })
        .eq('auth_id', authData.auth_id)

      // Mark reset token as used
      await supabase
        .from('StudioPasswordResets')
        .update({ used_at: new Date().toISOString() })
        .eq('reset_token', token)

      return { success: true }

    } catch (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Failed to reset password' }
    }
  }
}