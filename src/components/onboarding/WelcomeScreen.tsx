'use client';

import React from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

interface WelcomeScreenProps {
  onNext?: () => void;
}

export default function WelcomeScreen({ onNext }: WelcomeScreenProps) {
  const router = useRouter()

  const handleGetStarted = () => {
    if (onNext) {
      onNext();
    } else {
      router.push('/onboarding/support-preferences');
    }
  };

  const keyFeatures = [
    { icon: '🤝', title: 'Find a Friend', description: 'Match with someone who understands your journey.' },
    { icon: '💬', title: 'Talk & Share', description: 'Chat, call, or discuss with peers who\'ve been there.' },
    { icon: '🎓', title: 'Verified Support', description: 'Connect with people who are certified to guide you.' },
    { icon: '🌱', title: 'Grow Together', description: 'Learn coping strategies and support others.' },
  ]

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex flex-col items-center justify-center p-4 gradient-bg"
    >
      <div className="max-w-md w-full space-y-8 text-center">
        <motion.div
          initial={{ y: -20 }}
          animate={{ y: 0 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 100 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to Happistaa – A Friend in Need!
          </h1>
          <p className="text-lg text-gray-600 mb-8">
            You are not alone. Connect with peers who&apos;ve been through similar experiences and find the support you need, instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 100 }}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 gap-4">
            {keyFeatures.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 + (index * 0.1), duration: 0.3 }}
                className="bg-white rounded-lg p-4 text-left flex items-center shadow-sm"
              >
                <span className="text-2xl mr-3">{feature.icon}</span>
                <div>
                  <h3 className="font-medium text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <Button
            onClick={handleGetStarted}
            className="w-full py-6 text-lg rounded-full"
          >
            Get Started
          </Button>
          <Button
            onClick={() => router.push('/auth/login')}
            variant="outline"
            className="w-full py-6 text-lg rounded-full"
          >
            I already have an account
          </Button>
        </motion.div>
      </div>
    </motion.div>
  )
}