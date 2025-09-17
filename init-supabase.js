// init-supabase.js
// Simple script to initialize Supabase tables
require('dotenv').config();
const supabase = require('./config/supabase');

async function initializeSupabase() {
  console.log('🔄 Initializing Supabase database...');
  
  try {
    // Test basic connection first
    console.log('📊 Testing connection...');
    const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection failed:', error.message);
      console.log('💡 You may need to create tables in Supabase dashboard first');
      return false;
    }
    
    console.log('✅ Connection successful!');
    
    // Try to create a simple test user
    console.log('📝 Testing user creation...');
    const testUser = {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      role: 'student'
    };
    
    const { data: userData, error: userError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();
    
    if (userError) {
      console.log('⚠️ User creation failed:', userError.message);
      console.log('💡 This suggests the users table needs to be created');
      
      // Let's check what tables exist
      console.log('🔍 Checking existing tables...');
      const { data: tables } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      if (tables) {
        console.log('📋 Existing tables:', tables.map(t => t.table_name));
      }
      
      return false;
    } else {
      console.log('✅ User creation successful:', userData);
      
      // Clean up test user
      await supabase.from('users').delete().eq('id', userData.id);
      console.log('🧹 Test user cleaned up');
    }
    
    console.log('🎉 Database is ready!');
    return true;
    
  } catch (error) {
    console.log('💥 Unexpected error:', error.message);
    return false;
  }
}

// Run the initialization
initializeSupabase()
  .then((success) => {
    if (success) {
      console.log('\n✅ Database initialization completed successfully!');
      console.log('🚀 You can now start your server with: node server.js');
    } else {
      console.log('\n❌ Database initialization failed.');
      console.log('📖 Next steps:');
      console.log('1. Go to your Supabase dashboard');
      console.log('2. Go to SQL Editor');
      console.log('3. Run the SQL from config/database.sql');
      console.log('4. Or create tables manually in Table Editor');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
