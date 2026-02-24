import { useState, useEffect } from 'react'

function loadProfile() { 
  try { 
    return JSON.parse(localStorage.getItem('visa_profile')) 
  } catch { 
    return null 
  } 
}

function saveProfile(p) { 
  localStorage.setItem('visa_profile', JSON.stringify(p)) 
}

export function useProfile() {
  const [profile, setProfile] = useState(() => loadProfile())

  const updateProfile = (newProfile) => {
    setProfile(newProfile)
    saveProfile(newProfile)
  }

  return {
    profile,
    setProfile: updateProfile,
    loadProfile,
    saveProfile
  }
}