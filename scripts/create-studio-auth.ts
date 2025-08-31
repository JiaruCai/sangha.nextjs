// scripts/create-studio-auth.ts
import { config } from 'dotenv'

// Load environment variables
config()

async function createStudioAuth() {
  const args = process.argv.slice(2)
  
  if (args.length !== 3) {
    console.error('Usage: npm run create-studio-auth <organizerId> <email> <studioName>')
    console.error('Example: npm run create-studio-auth org123 studio@example.com "My Dance Studio"')
    process.exit(1)
  }

  const [organizerId, email, studioName] = args

  // Debug: Check if env vars are loaded
  console.log('Environment check:')
  console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Present' : 'Missing')
  console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Present' : 'Missing')
  console.log('---')

  try {
    // Dynamic import after env vars are loaded
    const { StudioAuthService } = await import('../lib/studio-auth')
    
    console.log('Creating studio auth...')
    console.log(`Organizer ID: ${organizerId}`)
    console.log(`Email: ${email}`)
    console.log(`Studio Name: ${studioName}`)
    console.log('---')
    
    // Let's debug step by step
    console.log('Step 1: Generating default password...')
    const defaultPassword = StudioAuthService.generateDefaultPassword(studioName)
    console.log('Default password generated:', defaultPassword)
    
    console.log('Step 2: Hashing password...')
    const passwordHash = await StudioAuthService.hashPassword(defaultPassword)
    console.log('Password hashed successfully')
    
    console.log('Step 3: Attempting database insert...')
    
    // Import Supabase client directly to test
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    const insertData = {
      organizer_id: organizerId,
      email: email,
      password_hash: passwordHash,
      default_password: true
    }
    
    console.log('Insert data:', insertData)
    
    const { data, error } = await supabase
      .from('studioauth')
      .insert(insertData)
      .select()
      .single()
    
    console.log('Supabase response:')
    console.log('Data:', data)
    console.log('Error:', error)
    
    if (error) {
      console.error('Supabase error details:')
      console.error('Message:', error.message)
      console.error('Details:', error.details)
      console.error('Hint:', error.hint)
      console.error('Code:', error.code)
      throw error
    }
    
    console.log('✅ Studio auth created successfully!')
    console.log('==========================================')
    console.log('📋 SAVE THESE DETAILS:')
    console.log('==========================================')
    console.log(`Auth ID: ${data.auth_id}`)
    console.log(`Organizer ID: ${data.organizer_id}`)
    console.log(`Email: ${data.email}`)
    console.log(`Default Password: ${defaultPassword}`)
    console.log('==========================================')
    console.log('⚠️  IMPORTANT: Send the password to the studio owner securely!')
    console.log('💡 They will be required to change it on first login.')
    
  } catch (error: any) {
    console.error('❌ Failed to create studio auth')
    console.error('Error object:', error)
    console.error('Error message:', error?.message)
    console.error('Error details:', error?.details)
    console.error('Error hint:', error?.hint)
    console.error('Error code:', error?.code)
    console.error('Full error:', JSON.stringify(error, null, 2))
    console.error('Stack trace:', error?.stack)
    process.exit(1)
  }
}

createStudioAuth()
