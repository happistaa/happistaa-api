'use client'

import React, { useState, Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface Therapist {
  id: string
  name: string
  specialization: string[]
  experience: string
  rating: number
  availability: string
  image: string
  bio: string
  languages: string[]
  price: string
}

interface BookingModalProps {
  therapist: Therapist
  isOpen: boolean
  onClose: () => void
  onBook: (bookingData: {
    date: string
    time: string
    type: 'video' | 'in-person'
    notes: string
  }) => void
}

export default function BookingModal({ therapist, isOpen, onClose, onBook }: BookingModalProps) {
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState<'video' | 'in-person'>('video')
  const [notes, setNotes] = useState('')
  const [selectedTime, setSelectedTime] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onBook({ date, time, type, notes })
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={onClose}>
        <div className="min-h-screen px-4 text-center">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-30" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span
            className="inline-block h-screen align-middle"
            aria-hidden="true"
          >
            &#8203;
          </span>
          
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-lg">
          <Dialog.Title className="text-2xl font-bold text-gray-900 mb-4">
            Book Session with {therapist.name}
          </Dialog.Title>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label htmlFor="time" className="block text-sm font-medium text-gray-700">
                Time
              </label>
              <input
                type="time"
                id="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Session Type
              </label>
              <div className="mt-1 space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="video"
                    checked={type === 'video'}
                    onChange={(e) => setType('video')}
                        className="form-radio text-primary"
                  />
                  <span className="ml-2">Video Call</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    value="in-person"
                    checked={type === 'in-person'}
                    onChange={(e) => setType('in-person')}
                        className="form-radio text-primary"
                  />
                  <span className="ml-2">In-Person</span>
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
                Additional Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                placeholder="Any specific concerns or topics you'd like to discuss?"
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Book Session
              </button>
            </div>
          </form>
        </div>
          </Transition.Child>
      </div>
    </Dialog>
    </Transition>
  )
}