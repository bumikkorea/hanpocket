import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://bhepzcgidsvxhwomfjyx.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoZXB6Y2dpZHN2eGh3b21manl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM5ODAwOTMsImV4cCI6MjA4OTU1NjA5M30.f9J0Vm1Eo3l14AIshDuzH5qUfB5iklfiibAoNF93Py0'

/**
 * 디바이스 ID 생성 및 저장
 * RLS 정책에서 device_id를 기반으로 접근 제어함
 */
function getDeviceId() {
  let id = localStorage.getItem('near_device_id')
  if (!id) {
    id = 'dev_' + crypto.randomUUID()
    localStorage.setItem('near_device_id', id)
  }
  return id
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    headers: {
      'x-device-id': getDeviceId()
    }
  }
})
