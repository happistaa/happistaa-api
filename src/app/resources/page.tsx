'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ResourceLinks, { Resource } from '@/components/ui/ResourceLinks';
import { Button } from '@/components/ui/button';

// Sample resources that demonstrate the component
const mentalHealthResources: Resource[] = [
  {
    id: '1',
    title: 'National Alliance on Mental Illness (NAMI)',
    description: 'NAMI provides advocacy, education, support and public awareness for individuals and families affected by mental illness.',
    url: 'https://www.nami.org',
    icon: 'psychology',
    category: 'Mental Health Organizations',
    embedable: true
  },
  {
    id: '2',
    title: 'Mental Health America',
    description: 'Promotes mental health, preventing mental disorders and achieving victory over mental illness through advocacy, education, research and services.',
    url: 'https://www.mhanational.org',
    icon: 'health_and_safety',
    category: 'Mental Health Organizations',
    embedable: true
  },
  {
    id: '3',
    title: 'Anxiety and Depression Association of America',
    description: 'Resources for anxiety, depression, and related disorders with information on symptoms, treatment, and finding help.',
    url: 'https://adaa.org',
    icon: 'sentiment_neutral',
    category: 'Specific Conditions',
    embedable: true
  },
  {
    id: '4',
    title: 'Psychology Today Therapist Finder',
    description: 'Find detailed professional listings for therapists, psychologists, and counselors in your area.',
    url: 'https://www.psychologytoday.com/us/therapists',
    icon: 'person_search',
    category: 'Find a Therapist',
    embedable: true
  },
  {
    id: '5',
    title: 'Mindfulness-Based Stress Reduction',
    description: 'Learn about mindfulness practices that help reduce stress and improve mental well-being.',
    url: 'https://www.mindful.org/what-is-mbsr/',
    icon: 'self_improvement',
    category: 'Self-Care Resources',
    embedable: true
  },
  {
    id: '6',
    title: 'Headspace',
    description: 'Meditation and mindfulness app with guided sessions for stress, sleep, focus and anxiety.',
    url: 'https://www.headspace.com',
    icon: 'headphones',
    category: 'Self-Care Resources',
    embedable: true
  }
];

const crisisResources: Resource[] = [
  {
    id: 'crisis-1',
    title: '988 Suicide & Crisis Lifeline',
    description: '24/7, free and confidential support for people in distress, prevention and crisis resources.',
    url: 'https://988lifeline.org',
    icon: 'crisis_alert',
    category: 'Crisis Support',
    embedable: true
  },
  {
    id: 'crisis-2',
    title: 'Crisis Text Line',
    description: 'Text HOME to 741741 to connect with a Crisis Counselor. Free 24/7 support.',
    url: 'https://www.crisistextline.org',
    icon: 'message',
    category: 'Crisis Support',
    embedable: true
  }
];

// Educational resources with embeddable video content
const educationalResources: Resource[] = [
  {
    id: 'edu-1',
    title: 'Understanding Mental Health - Khan Academy',
    description: 'Introduction to mental health concepts and understanding common conditions.',
    url: 'https://www.youtube.com/embed/DxIDKZHW3-E',
    icon: 'school',
    category: 'Educational',
    embedable: true
  },
  {
    id: 'edu-2',
    title: 'Stress Management Techniques',
    description: 'Learn effective techniques for managing stress in your daily life.',
    url: 'https://www.youtube.com/embed/0fL-pn80s-c',
    icon: 'spa',
    category: 'Educational',
    embedable: true
  },
  {
    id: 'edu-3',
    title: 'The Science of Well-Being - Yale Course Introduction',
    description: 'Introduction to the science of well-being from Yale University.',
    url: 'https://www.youtube.com/embed/ZizdB0TgAVM',
    icon: 'science',
    category: 'Educational',
    embedable: true
  }
];

export default function ResourcesPage() {
  const router = useRouter();
  
  return (
    <div className="min-h-screen gradient-bg p-4 sm:p-6">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Resources
          </h1>
          <div className="flex space-x-2">
            <Button
              onClick={() => router.push('/dashboard')}
              variant="outline"
              className="flex items-center"
              size="sm"
            >
              <span className="material-icons">home</span>
            </Button>
          </div>
        </div>
        
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm mb-6 sm:mb-8">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-4">
            Finding Help & Support
          </h2>
          <p className="text-gray-600 text-sm sm:text-base">
            We've compiled a collection of resources to help you on your mental health journey.
            These links provide reliable information, tools, and services from trusted organizations.
            You can view resources directly within the app or open them in a new tab.
          </p>
        </div>
        
        <ResourceLinks 
          resources={crisisResources}
          title="Crisis & Emergency Resources"
          description="If you're experiencing a crisis or emergency, these resources provide immediate support."
          columns={1}
          openInApp={true}
        />
        
        <ResourceLinks 
          resources={mentalHealthResources}
          title="Mental Health Resources"
          description="Resources for ongoing mental health support, information, and self-care."
          columns={1}
          openInApp={true}
        />
        
        <ResourceLinks 
          resources={educationalResources}
          title="Educational Videos"
          description="Learn more about mental health concepts and techniques through these educational videos."
          columns={1}
          openInApp={true}
        />
        
        <div className="bg-blue-50 border border-blue-100 p-4 sm:p-5 rounded-xl">
          <h2 className="text-md sm:text-lg font-semibold text-blue-900 mb-2">
            Having trouble with links?
          </h2>
          <p className="text-blue-800 mb-4 text-sm sm:text-base">
            If you're experiencing issues with resources not loading properly, try these options:
          </p>
          <ul className="list-disc list-inside text-blue-700 space-y-2 mb-4 text-sm sm:text-base">
            <li>Click the "Open in New Tab" button when viewing embedded content</li>
            <li>Check your browser settings to ensure pop-ups aren't being blocked</li>
            <li>Try using a different browser if content doesn't load</li>
            <li>Update your app if you're using a mobile application</li>
          </ul>
          <div className="flex items-center justify-between mt-4">
            <p className="text-blue-800 text-sm sm:text-base">
              For technical support:
            </p>
            <Button
              onClick={() => {
                const emailAddress = 'support@happistaa.com';
                window.location.href = `mailto:${emailAddress}?subject=Resources%20Link%20Issue`;
              }}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              Contact Support
            </Button>
          </div>
        </div>
        
        {/* Direct access to resources with copy option */}
        <div className="bg-white p-4 sm:p-5 rounded-xl shadow-sm">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
            Direct Link Access
          </h2>
          <p className="text-gray-600 mb-4 text-sm sm:text-base">
            If you're having trouble with the resource cards above, you can copy these direct links:
          </p>
          <div className="space-y-3">
            {[...crisisResources, ...mentalHealthResources, ...educationalResources].map((resource) => (
              <div key={resource.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">{resource.title}</p>
                  <p className="text-gray-500 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-[300px]">{resource.url}</p>
                </div>
                <Button
                  onClick={() => {
                    navigator.clipboard.writeText(resource.url);
                    // Show a tooltip or notification here
                    alert(`Copied: ${resource.url}`);
                  }}
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                >
                  <span className="material-icons mr-1 text-sm">content_copy</span>
                  Copy
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}