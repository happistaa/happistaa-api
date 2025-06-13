'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import usePeerSupport, { SupportRequest } from '@/hooks/usePeerSupport';

interface SupportRequestsProps {
  onAccept: (request: SupportRequest) => void;
  onClose: () => void;
}

export default function SupportRequests({ onAccept, onClose }: SupportRequestsProps) {
  const { isLoading, error, supportRequests, fetchSupportRequests, updateSupportRequest } = usePeerSupport();
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    // Load received requests by default
    fetchSupportRequests(activeTab);
  }, [fetchSupportRequests, activeTab]);

  const handleAccept = async (request: SupportRequest) => {
    const updatedRequest = await updateSupportRequest(request.id, 'accepted');
    if (updatedRequest) {
      onAccept(request);
    }
  };

  const handleReject = async (request: SupportRequest) => {
    await updateSupportRequest(request.id, 'rejected');
    // Refresh the list after rejection
    fetchSupportRequests(activeTab);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-xl font-semibold text-gray-900">Support Requests</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <span className="material-icons">close</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'received'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('received')}
        >
          Received
        </button>
        <button
          className={`px-4 py-3 text-sm font-medium ${
            activeTab === 'sent'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('sent')}
        >
          Sent
        </button>
      </div>

      {/* Content */}
      <div className="p-4 max-h-[500px] overflow-y-auto">
        {isLoading ? (
          <div className="flex justify-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-red-500">{error}</div>
        ) : supportRequests.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            No {activeTab} support requests found.
          </div>
        ) : (
          <div className="space-y-4">
            {supportRequests.map((request) => (
              <div 
                key={request.id} 
                className="border rounded-lg p-4 hover:border-blue-200 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl">
                    {request.sender?.avatar_url || '👤'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {request.is_anonymous && activeTab === 'received' 
                        ? 'Anonymous User' 
                        : (request.sender?.name || 'User')}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(request.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-sm bg-blue-100 text-blue-700 px-2 py-1 rounded">
                    {request.status}
                  </div>
                </div>

                <p className="my-3 text-gray-700">{request.message}</p>
                
                {/* Experience areas */}
                {request.sender?.support_preferences && request.sender.support_preferences.length > 0 && (
                  <div className="mt-2 mb-3">
                    <p className="text-xs text-gray-500 mb-1">Experience areas:</p>
                    <div className="flex flex-wrap gap-1">
                      {request.sender.support_preferences.map((pref, i) => (
                        <span 
                          key={i}
                          className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full"
                        >
                          {pref}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Actions for received requests */}
                {activeTab === 'received' && request.status === 'pending' && (
                  <div className="flex justify-end gap-2 mt-3">
                    <Button
                      onClick={() => handleReject(request)}
                      variant="outline"
                      size="sm"
                    >
                      Decline
                    </Button>
                    <Button
                      onClick={() => handleAccept(request)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Accept
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 