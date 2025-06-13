// src/components/App.tsx
'use client'

import { useState } from 'react'
import WelcomeScreen from './onboarding/WelcomeScreen'
import JourneyScreen from './onboarding/JourneyScreen'
import SupportPreferencesScreen from './onboarding/SupportPreferences'
import CommunityGuidelinesScreen from './onboarding/CommunityGuidelines'
import Dashboard from './dashboard/Dashboard'
import ProfileSetup from './profile/ProfileSetup'
import { UserProfile } from './profile/ProfileSetup'

export default function App() {
  const [currentStep, setCurrentStep] = useState('welcome')
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [showProfileSetup, setShowProfileSetup] = useState(false)

  const handleNextStep = () => {
    switch (currentStep) {
      case 'welcome':
        setCurrentStep('journey')
        break
      case 'journey':
        setCurrentStep('preferences')
        break
      case 'preferences':
        setCurrentStep('guidelines')
        break
      case 'guidelines':
        setCurrentStep('dashboard')
        break
      default:
        break
    }
  }

  const handleProfileComplete = (profileData: UserProfile) => {
    setUserProfile(profileData)
    setShowProfileSetup(false)
  }

  return (
    <main>
      {currentStep === 'welcome' && <WelcomeScreen onNext={handleNextStep} />}
      {currentStep === 'journey' && <JourneyScreen onNext={handleNextStep} />}
      {currentStep === 'preferences' && <SupportPreferencesScreen onNext={handleNextStep} />}
      {currentStep === 'guidelines' && <CommunityGuidelinesScreen onNext={handleNextStep} />}
      {currentStep === 'dashboard' && (
        <>
          <Dashboard 
            userProfile={userProfile} 
            onStartProfileSetup={() => setShowProfileSetup(true)}
          />
          {showProfileSetup && (
            <ProfileSetup onComplete={handleProfileComplete} />
          )}
        </>
      )}
    </main>
  )
}