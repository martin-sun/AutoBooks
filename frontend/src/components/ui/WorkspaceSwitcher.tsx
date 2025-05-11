'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { ChevronDown, Building, User, Plus } from 'lucide-react';
import CreateWorkspaceModal from './CreateWorkspaceModal';

interface Workspace {
  id: string;
  name: string;
  type: string;
}

interface WorkspaceSwitcherProps {
  currentWorkspaceId: string;
  onWorkspaceChange: (workspaceId: string) => void;
}

const WorkspaceSwitcher: React.FC<WorkspaceSwitcherProps> = ({
  currentWorkspaceId,
  onWorkspaceChange
}) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [hasBusinessWorkspace, setHasBusinessWorkspace] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
        const supabase = createClient(supabaseUrl, supabaseAnonKey);
        
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        
        const { data, error } = await supabase
          .from('workspaces')
          .select('id, name, type')
          .eq('user_id', session.user.id);
        
        if (error) {
          console.error('Error fetching workspaces:', error);
          return;
        }
        
        if (data) {
          setWorkspaces(data);
          const current = data.find(ws => ws.id === currentWorkspaceId);
          if (current) {
            setCurrentWorkspace(current);
          }
          
          // Check if user already has a business workspace
          const businessWorkspace = data.find(ws => ws.type === 'business');
          setHasBusinessWorkspace(!!businessWorkspace);
        }
      } catch (err) {
        console.error('Error in fetchWorkspaces:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWorkspaces();
  }, [currentWorkspaceId]);

  const handleWorkspaceSelect = (workspace: Workspace) => {
    setCurrentWorkspace(workspace);
    onWorkspaceChange(workspace.id);
    setIsOpen(false);
  };
  
  const handleWorkspaceCreated = (newWorkspaceId: string) => {
    // Refresh workspaces list and switch to the new workspace
    onWorkspaceChange(newWorkspaceId);
    setShowCreateModal(false);
  };

  if (loading) {
    return (
      <div className="flex items-center h-10 px-3 text-sm text-gray-600">
        <div className="animate-pulse h-4 w-24 bg-gray-200 rounded"></div>
      </div>
    );
  }

  if (!currentWorkspace) {
    return null;
  }

  return (
    <div className="relative">
      {/* CreateWorkspaceModal */}
      {showCreateModal && (
        <CreateWorkspaceModal 
          isOpen={showCreateModal} 
          onClose={() => setShowCreateModal(false)} 
          onWorkspaceCreated={handleWorkspaceCreated} 
        />
      )}
      
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        <div className="flex items-center">
          {currentWorkspace.type === 'business' ? (
            <Building className="w-4 h-4 mr-2 text-gray-500" />
          ) : (
            <User className="w-4 h-4 mr-2 text-gray-500" />
          )}
          <span>{currentWorkspace.name}</span>
        </div>
        <ChevronDown className="w-4 h-4 ml-2" />
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          <ul className="py-1">
            {workspaces.map((workspace) => (
              <li key={workspace.id}>
                <button
                  onClick={() => handleWorkspaceSelect(workspace)}
                  className={`flex items-center w-full px-3 py-2 text-sm ${
                    workspace.id === currentWorkspace.id
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {workspace.type === 'business' ? (
                    <Building className="w-4 h-4 mr-2 text-gray-500" />
                  ) : (
                    <User className="w-4 h-4 mr-2 text-gray-500" />
                  )}
                  {workspace.name}
                </button>
              </li>
            ))}
            
            {/* Add Business Workspace option - only show if user doesn't have one */}
            {!hasBusinessWorkspace && (
              <li>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setShowCreateModal(true);
                  }}
                  className="flex items-center w-full px-3 py-2 text-sm text-blue-600 hover:bg-gray-100"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Business Workspace
                </button>
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default WorkspaceSwitcher;
