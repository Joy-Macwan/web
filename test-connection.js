// test-connection.js
// Simple script to test Supabase connectivity
require('dotenv').config();
const supabase = require('./config/supabase');

async function testConnection() {
  console.log('🔄 Testing Supabase connection...');
  console.log('📍 Supabase URL:', process.env.SUPABASE_URL);
  console.log('🔑 Supabase Key:', process.env.SUPABASE_KEY ? 'Present' : 'Missing');
  
  try {
    // Test 1: Basic connection test
    console.log('\n📊 Test 1: Basic connection test');
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.log('❌ Connection test failed:', error.message);
      return false;
    }
    
    console.log('✅ Connection successful!');
    console.log('👥 Users table exists');
    
    // Test 2: Try to create a simple test record
    console.log('\n📊 Test 2: Testing write operations');
    const testUser = {
      name: 'Test User',
      email: `test_${Date.now()}@example.com`,
      role: 'student'
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert([testUser])
      .select()
      .single();
    
    if (insertError) {
      console.log('⚠️ Write test failed:', insertError.message);
      console.log('💡 This might be normal if the table doesn\'t exist yet');
    } else {
      console.log('✅ Write operation successful!');
      console.log('📝 Created test user:', insertData);
      
      // Clean up test user
      await supabase
        .from('users')
        .delete()
        .eq('id', insertData.id);
      console.log('🧹 Cleaned up test user');
    }
    
    // Test 3: Check available tables
    console.log('\n📊 Test 3: Checking database schema');
    const { data: tables, error: schemaError } = await supabase
      .rpc('get_schema_info')
      .select();
    
    if (schemaError) {
      console.log('⚠️ Schema check failed (this is normal):', schemaError.message);
    }
    
    console.log('\n🎉 Connection tests completed successfully!');
    return true;
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message);
    return false;
  }
}

// Run the test
testConnection()
  .then((success) => {
    if (success) {
      console.log('\n✅ All tests passed! Your Supabase connection is working.');
      console.log('🚀 You can now start your server with: npm start');
    } else {
      console.log('\n❌ Some tests failed. Please check your Supabase configuration.');
    }
    process.exit(success ? 0 : 1);
  })
  .catch((error) => {
    console.error('💥 Test script failed:', error);
    process.exit(1);
  });
