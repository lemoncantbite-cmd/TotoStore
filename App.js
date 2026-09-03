import { useEffect } from 'react'
import { Text, View } from 'react-native'
import { supabase } from './src/lib/supabaseClient'

export default Sentry.wrap(function App() {
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
});
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'https://4db5c7437641d85d15b40cd71b405bf0@o4512011009785856.ingest.us.sentry.io/4512011408965632',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});
