// scripts/reset-studio-password.ts
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import bcrypt from 'bcryptjs'

// Load environment variables
config()

async function resetStudioPassword() {
  const args = process.argv.slice(2)
  
  if (args.length < 1 || args.length > 2) {
    console.error('Usage: npm run reset-studio-password <email> [newPassword]')
    console.error('Example: npm run reset-studio-password studio@example.com')
    console.error('         npm run reset-studio-password studio@example.com MyNewPassword123!')
    console.error('')
    console.error('If no password is provided, a new default password will be generated.')
    process.exit(1)
  }

  const [email, newPassword] = args

  // Check environment variables
  console.log('Environment check:')
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing')
  console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing')
  console.log('---')

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    // Find the studio auth record
    console.log(`🔍 Looking for studio with email: ${email}`)
    
    const { data: authData, error: fetchError } = await supabase
      .from('studioauth')
      .select(`
        *,
        DiscoveryTabOrganizers (
          name,
          description
        )
      `)
      .eq('email', email)
      .single()

    if (fetchError || !authData) {
      console.error('❌ Studio not found with email:', email)
      console.error('Error:', fetchError)
      
      // List all available studio emails for reference
      console.log('\n📋 Available studio accounts:')
      const { data: allStudios } = await supabase
        .from('studioauth')
        .select('email, organizer_id, created_at')
        .order('created_at', { ascending: false })
      
      if (allStudios && allStudios.length > 0) {
        allStudios.forEach(studio => {
          console.log(`  - ${studio.email} (Organizer: ${studio.organizer_id})`)
        })
      } else {
        console.log('  No studio accounts found')
      }
      
      process.exit(1)
    }

    console.log('\n✅ Found studio account:')
    console.log('==========================================')
    console.log(`Auth ID: ${authData.auth_id}`)
    console.log(`Organizer ID: ${authData.organizer_id}`)
    console.log(`Email: ${authData.email}`)
    console.log(`Studio Name: ${authData.DiscoveryTabOrganizers?.name || 'N/A'}`)
    console.log(`Active: ${authData.is_active}`)
    console.log(`Default Password: ${authData.default_password}`)
    console.log(`Last Login: ${authData.last_login || 'Never'}`)
    console.log(`Login Attempts: ${authData.login_attempts || 0}`)
    console.log(`Locked Until: ${authData.locked_until || 'Not locked'}`)
    console.log('==========================================\n')

    // Generate or use provided password
    let finalPassword: string
    if (newPassword) {
      if (newPassword.length < 8) {
        console.error('❌ Password must be at least 8 characters long')
        process.exit(1)
      }
      finalPassword = newPassword
      console.log('🔐 Using provided password')
    } else {
      // Generate a new default password
      const studioName = authData.DiscoveryTabOrganizers?.name || 'Studio'
      const cleanName = studioName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 8)
      const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
      finalPassword = `${cleanName}2025${randomSuffix}!`
      console.log('🔐 Generated new default password')
    }

    // Hash the new password
    console.log('🔄 Hashing new password...')
    const passwordHash = await bcrypt.hash(finalPassword, 12)

    // Update the password
    console.log('💾 Updating password in database...')
    const { error: updateError } = await supabase
      .from('studioauth')
      .update({
        password_hash: passwordHash,
        default_password: !newPassword, // Mark as default if auto-generated
        login_attempts: 0, // Reset login attempts
        locked_until: null, // Unlock account
        password_reset_token: null, // Clear any reset tokens
        password_reset_expires: null,
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', authData.auth_id)

    if (updateError) {
      console.error('❌ Failed to update password')
      console.error('Error:', updateError)
      process.exit(1)
    }

    console.log('\n✅ Password reset successfully!')
    console.log('==========================================')
    console.log('📋 NEW LOGIN CREDENTIALS:')
    console.log('==========================================')
    console.log(`Email: ${authData.email}`)
    console.log(`Password: ${finalPassword}`)
    console.log('==========================================')
    
    if (!newPassword) {
      console.log('⚠️  IMPORTANT: This is a default password.')
      console.log('💡 The user will be required to change it on first login.')
    }
    
    console.log('\n🚀 You can now login at: /studio-portal')

  } catch (error: any) {
    console.error('❌ Failed to reset password')
    console.error('Error:', error)
    console.error('Message:', error?.message)
    console.error('Details:', error?.details)
    process.exit(1)
  }
}

// Add helper function to list all studio accounts
async function listAllStudios() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: studios, error } = await supabase
    .from('studioauth')
    .select(`
      *,
      DiscoveryTabOrganizers (
        name
      )
    `)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching studios:', error)
    return
  }

  console.log('\n📋 All Studio Accounts:')
  console.log('==========================================')
  
  if (!studios || studios.length === 0) {
    console.log('No studio accounts found')
    return
  }

  studios.forEach((studio, index) => {
    console.log(`\n${index + 1}. ${studio.DiscoveryTabOrganizers?.name || 'Unknown Studio'}`)
    console.log(`   Email: ${studio.email}`)
    console.log(`   Organizer ID: ${studio.organizer_id}`)
    console.log(`   Active: ${studio.is_active}`)
    console.log(`   Default Password: ${studio.default_password}`)
    console.log(`   Last Login: ${studio.last_login || 'Never'}`)
  })
  
  console.log('==========================================')
}

// Check if --list flag is provided
if (process.argv.includes('--list')) {
  listAllStudios()
} else {
  resetStudioPassword()
}