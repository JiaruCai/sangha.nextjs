// scripts/debug-supabase.ts
import { config } from 'dotenv'

// Load environment variables
config()

async function debugSupabase() {
  try {
    const { createClient } = await import('@supabase/supabase-js')
    
    console.log('Environment variables:')
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    console.log('SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[PRESENT]' : '[MISSING]')
    console.log('---')
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    console.log('Testing connection...')
    
    // Test 1: Basic connection
    const { data: healthCheck, error: healthError } = await supabase
      .from('_supabase_migrations')
      .select('*')
      .limit(1)
    
    console.log('Health check result:')
    console.log('Data:', healthCheck)
    console.log('Error:', healthError)
    console.log('---')
    
    // Test 2: Check if StudioAuth table exists
    console.log('Testing StudioAuth table access...')
    const { data: tableData, error: tableError } = await supabase
      .from('studioauth')
      .select('*')
      .limit(1)
    
    console.log('StudioAuth table test:')
    console.log('Data:', tableData)
    console.log('Error:', tableError)
    console.log('---')
    
    // Test 3: Check table schema
    if (!tableError) {
      console.log('Testing insert with minimal data...')
      const { data: insertData, error: insertError } = await supabase
        .from('StudioAuth')
        .insert({
          organizer_id: 'test-id',
          email: 'test@example.com',
          password_hash: 'test-hash',
          default_password: true
        })
        .select()
      
      console.log('Insert test:')
      console.log('Data:', insertData)
      console.log('Error:', insertError)
      
      // Clean up test data if it was inserted
      if (insertData && insertData[0]) {
        await supabase
          .from('StudioAuth')
          .delete()
          .eq('email', 'test@example.com')
        console.log('Test data cleaned up')
      }
    }
    
  } catch (error) {
    console.error('Debug error:', error)
  }
}

debugSupabase()
