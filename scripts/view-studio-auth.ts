// scripts/view-studio-auth.ts
import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'

// Load environment variables
config()

async function viewStudioAuth() {
  const args = process.argv.slice(2)
  
  if (args.length !== 1) {
    console.error('Usage: npm run view-studio-auth <email>')
    console.error('Example: npm run view-studio-auth studio@example.com')
    console.error('')
    console.error('To list all studios: npm run view-studio-auth --all')
    process.exit(1)
  }

  const [emailOrFlag] = args

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ Missing required environment variables')
    process.exit(1)
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  try {
    if (emailOrFlag === '--all') {
      // List all studios
      const { data: studios, error } = await supabase
        .from('studioauth')
        .select(`
          *,
          DiscoveryTabOrganizers (
            name,
            description,
            contact_email,
            phone
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching studios:', error)
        process.exit(1)
      }

      console.log('\n📋 All Studio Accounts:')
      console.log('==========================================')
      
      if (!studios || studios.length === 0) {
        console.log('No studio accounts found')
        return
      }

      studios.forEach((studio, index) => {
        console.log(`\n${index + 1}. ${studio.DiscoveryTabOrganizers?.name || 'Unknown Studio'}`)
        console.log(`   Auth ID: ${studio.auth_id}`)
        console.log(`   Email: ${studio.email}`)
        console.log(`   Organizer ID: ${studio.organizer_id}`)
        console.log(`   Contact Email: ${studio.DiscoveryTabOrganizers?.contact_email || 'N/A'}`)
        console.log(`   Phone: ${studio.DiscoveryTabOrganizers?.phone || 'N/A'}`)
        console.log(`   Active: ${studio.is_active ? '✅' : '❌'}`)
        console.log(`   Default Password: ${studio.default_password ? 'Yes ⚠️' : 'No ✅'}`)
        console.log(`   Login Attempts: ${studio.login_attempts || 0}`)
        console.log(`   Locked: ${studio.locked_until ? `Until ${new Date(studio.locked_until).toLocaleString()}` : 'No'}`)
        console.log(`   Last Login: ${studio.last_login ? new Date(studio.last_login).toLocaleString() : 'Never'}`)
        console.log(`   Created: ${new Date(studio.created_at).toLocaleDateString()}`)
      })
      
      console.log('\n==========================================')
      console.log(`Total studios: ${studios.length}`)
      
    } else {
      // View specific studio
      const email = emailOrFlag
      console.log(`🔍 Looking for studio with email: ${email}`)
      
      const { data: authData, error: fetchError } = await supabase
        .from('studioauth')
        .select(`
          *,
          DiscoveryTabOrganizers (*)
        `)
        .eq('email', email)
        .single()

      if (fetchError || !authData) {
        console.error('❌ Studio not found with email:', email)
        
        // Try to find similar emails
        const { data: similarStudios } = await supabase
          .from('studioauth')
          .select('email')
          .ilike('email', `%${email.split('@')[0]}%`)
          .limit(5)
        
        if (similarStudios && similarStudios.length > 0) {
          console.log('\n💡 Did you mean one of these?')
          similarStudios.forEach(studio => {
            console.log(`  - ${studio.email}`)
          })
        }
        
        process.exit(1)
      }

      console.log('\n✅ Found studio account:')
      console.log('==========================================')
      console.log('🔐 AUTH DETAILS:')
      console.log(`Auth ID: ${authData.auth_id}`)
      console.log(`Email: ${authData.email}`)
      console.log(`Organizer ID: ${authData.organizer_id}`)
      console.log(`Active: ${authData.is_active ? '✅ Yes' : '❌ No'}`)
      console.log(`Default Password: ${authData.default_password ? '⚠️ Yes (needs reset)' : '✅ No'}`)
      console.log(`Password Hash: ${authData.password_hash.substring(0, 20)}...`)
      console.log(`Login Attempts: ${authData.login_attempts || 0}`)
      console.log(`Locked Until: ${authData.locked_until || 'Not locked'}`)
      console.log(`Last Login: ${authData.last_login ? new Date(authData.last_login).toLocaleString() : 'Never'}`)
      console.log(`Created: ${new Date(authData.created_at).toLocaleDateString()}`)
      console.log(`Updated: ${new Date(authData.updated_at).toLocaleDateString()}`)
      
      if (authData.password_reset_token) {
        console.log(`\n⚠️ PASSWORD RESET PENDING:`)
        console.log(`Reset Token: ${authData.password_reset_token.substring(0, 20)}...`)
        console.log(`Expires: ${authData.password_reset_expires ? new Date(authData.password_reset_expires).toLocaleString() : 'N/A'}`)
      }
      
      if (authData.DiscoveryTabOrganizers) {
        console.log('\n🏢 STUDIO DETAILS:')
        console.log(`Name: ${authData.DiscoveryTabOrganizers.name}`)
        console.log(`Description: ${authData.DiscoveryTabOrganizers.description || 'N/A'}`)
        console.log(`Contact Email: ${authData.DiscoveryTabOrganizers.contact_email || 'N/A'}`)
        console.log(`Phone: ${authData.DiscoveryTabOrganizers.phone || 'N/A'}`)
        console.log(`Address: ${authData.DiscoveryTabOrganizers.address || 'N/A'}`)
        console.log(`Website: ${authData.DiscoveryTabOrganizers.website_url || 'N/A'}`)
        
        if (authData.DiscoveryTabOrganizers.business_hours) {
          console.log(`Business Hours: ${JSON.stringify(authData.DiscoveryTabOrganizers.business_hours, null, 2)}`)
        }
      }
      
      console.log('==========================================')
      
      if (authData.default_password) {
        console.log('\n💡 This account still has the default password.')
        console.log('   Run: npm run reset-studio-password ' + email)
        console.log('   to generate a new password.')
      }
      
      if (authData.locked_until && new Date() < new Date(authData.locked_until)) {
        console.log('\n🔒 This account is currently locked.')
        console.log('   Run: npm run reset-studio-password ' + email)
        console.log('   to unlock and reset the password.')
      }
    }

  } catch (error: any) {
    console.error('❌ Failed to fetch studio auth details')
    console.error('Error:', error)
    process.exit(1)
  }
}

viewStudioAuth()