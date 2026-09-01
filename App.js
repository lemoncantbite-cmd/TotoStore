import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { supabase } from './src/lib/supabaseClient'

export default function App() {
  useEffect(() => {
    async function testConnection() {
      // 1. Supabase ke 'todos' table se sara data maango
      const { data, error } = await supabase.from('todos').select('*')

      if (error) {
        console.log('🔴 Connection Error:', error.message)
      } else {
        console.log('🟢 Connection Successful! Data:', data)
      }
    }

    testConnection()
  }, [])

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>TotoStore Supabase Screen</Text>
    </View>
  )
}
