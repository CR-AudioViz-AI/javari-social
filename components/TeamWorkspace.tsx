'use client'

import { useState, useEffect } from 'react'
import { 
  Users, UserPlus, Settings, Crown, Shield, Eye,
  Mail, Link2, Copy, Check, X, Search, MoreVertical,
  Folder, FolderPlus, Share2, Lock, Globe, Clock,
  Star, Trash2, Edit3, MessageSquare, Bell, ArrowUpRight
} from 'lucide-react'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar: string
  role: 'owner' | 'admin' | 'editor' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: string
  lastActive: string
}

interface SharedFolder {
  id: string
  name: string
  designCount: number
  sharedWith: TeamMember[]
  visibility: 'private' | 'team' | 'public'
  createdAt: string
  updatedAt: string
}

interface TeamActivity {
  id: string
  type: 'design_created' | 'design_edited' | 'comment_added' | 'member_joined' | 'folder_shared'
  user: TeamMember
  target: string
  timestamp: string
}

interface TeamWorkspaceProps {
  onClose?: () => void
  onSelectFolder?: (folder: SharedFolder) => void
}

const DEMO_TEAM: TeamMember[] = [
  { id: '1', name: 'Roy Henderson', email: 'roy@craudiovizai.com', avatar: '/avatars/roy.jpg', role: 'owner', status: 'active', joinedAt: '2024-01-01', lastActive: 'Just now' },
  { id: '2', name: 'Sarah Chen', email: 'sarah@example.com', avatar: '', role: 'admin', status: 'active', joinedAt: '2024-03-15', lastActive: '2 hours ago' },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', avatar: '', role: 'editor', status: 'active', joinedAt: '2024-05-20', lastActive: '1 day ago' },
  { id: '4', name: 'Emily Davis', email: 'emily@example.com', avatar: '', role: 'viewer', status: 'pending', joinedAt: '2024-12-01', lastActive: 'Never' },
]

const DEMO_FOLDERS: SharedFolder[] = [
  { id: '1', name: 'Marketing Campaign Q4', designCount: 24, sharedWith: DEMO_TEAM.slice(0, 3), visibility: 'team', createdAt: '2024-10-01', updatedAt: '2024-12-27' },
  { id: '2', name: 'Social Media Templates', designCount: 56, sharedWith: DEMO_TEAM, visibility: 'team', createdAt: '2024-08-15', updatedAt: '2024-12-26' },
  { id: '3', name: 'Brand Assets', designCount: 12, sharedWith: DEMO_TEAM.slice(0, 2), visibility: 'private', createdAt: '2024-06-01', updatedAt: '2024-12-20' },
  { id: '4', name: 'Client Deliverables', designCount: 8, sharedWith: DEMO_TEAM.slice(0, 1), visibility: 'private', createdAt: '2024-11-10', updatedAt: '2024-12-25' },
]

const DEMO_ACTIVITIES: TeamActivity[] = [
  { id: '1', type: 'design_created', user: DEMO_TEAM[1], target: 'Holiday Sale Banner', timestamp: '2 hours ago' },
  { id: '2', type: 'comment_added', user: DEMO_TEAM[2], target: 'Instagram Story Template', timestamp: '4 hours ago' },
  { id: '3', type: 'design_edited', user: DEMO_TEAM[0], target: 'Product Launch Post', timestamp: '6 hours ago' },
  { id: '4', type: 'folder_shared', user: DEMO_TEAM[1], target: 'Marketing Campaign Q4', timestamp: '1 day ago' },
  { id: '5', type: 'member_joined', user: DEMO_TEAM[3], target: 'Team', timestamp: '2 days ago' },
]

export default function TeamWorkspace({ onClose, onSelectFolder }: TeamWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<'folders' | 'members' | 'activity' | 'settings'>('folders')
  const [team, setTeam] = useState<TeamMember[]>(DEMO_TEAM)
  const [folders, setFolders] = useState<SharedFolder[]>(DEMO_FOLDERS)
  const [activities] = useState<TeamActivity[]>(DEMO_ACTIVITIES)
  const [searchQuery, setSearchQuery] = useState('')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'editor' | 'viewer'>('editor')
  const [newFolderName, setNewFolderName] = useState('')
  const [copied, setCopied] = useState(false)

  const filteredFolders = folders.filter(f => 
    f.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredMembers = team.filter(m => 
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'text-yellow-400'
      case 'admin': return 'text-purple-400'
      case 'editor': return 'text-blue-400'
      case 'viewer': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-4 h-4" />
      case 'admin': return <Shield className="w-4 h-4" />
      case 'editor': return <Edit3 className="w-4 h-4" />
      case 'viewer': return <Eye className="w-4 h-4" />
      default: return null
    }
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'design_created': return <FolderPlus className="w-4 h-4 text-green-400" />
      case 'design_edited': return <Edit3 className="w-4 h-4 text-blue-400" />
      case 'comment_added': return <MessageSquare className="w-4 h-4 text-purple-400" />
      case 'member_joined': return <UserPlus className="w-4 h-4 text-cyan-400" />
      case 'folder_shared': return <Share2 className="w-4 h-4 text-orange-400" />
      default: return null
    }
  }

  const handleInvite = () => {
    if (!inviteEmail) return
    const newMember: TeamMember = {
      id: Date.now().toString(),
      name: inviteEmail.split('@')[0],
      email: inviteEmail,
      avatar: '',
      role: inviteRole,
      status: 'pending',
      joinedAt: new Date().toISOString().split('T')[0],
      lastActive: 'Never'
    }
    setTeam([...team, newMember])
    setInviteEmail('')
    setShowInviteModal(false)
  }

  const handleCreateFolder = () => {
    if (!newFolderName) return
    const newFolder: SharedFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      designCount: 0,
      sharedWith: [team[0]],
      visibility: 'private',
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    }
    setFolders([newFolder, ...folders])
    setNewFolderName('')
    setShowNewFolderModal(false)
  }

  const copyInviteLink = () => {
    navigator.clipboard.writeText('https://crav-social-graphics.vercel.app/invite/abc123')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-semibold text-white">CR AudioViz AI Team</h2>
            <p className="text-sm text-gray-400">{team.length} members · {folders.length} shared folders</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInviteModal(true)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <UserPlus className="w-4 h-4" />
            Invite
          </button>
          {onClose && (
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-700 px-4">
        <div className="flex gap-1">
          {[
            { id: 'folders', label: 'Folders', icon: Folder },
            { id: 'members', label: 'Members', icon: Users },
            { id: 'activity', label: 'Activity', icon: Clock },
            { id: 'settings', label: 'Settings', icon: Settings },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-purple-500 text-purple-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-gray-800">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder={`Search ${activeTab}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 max-h-96 overflow-y-auto">
        {/* Folders Tab */}
        {activeTab === 'folders' && (
          <div className="space-y-3">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="w-full flex items-center gap-3 p-3 border-2 border-dashed border-gray-700 rounded-lg text-gray-400 hover:text-white hover:border-purple-500 transition-colors"
            >
              <FolderPlus className="w-5 h-5" />
              Create new folder
            </button>
            
            {filteredFolders.map(folder => (
              <div
                key={folder.id}
                onClick={() => onSelectFolder?.(folder)}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750 cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gray-700 rounded-lg flex items-center justify-center">
                    {folder.visibility === 'private' ? (
                      <Lock className="w-5 h-5 text-gray-400" />
                    ) : folder.visibility === 'public' ? (
                      <Globe className="w-5 h-5 text-green-400" />
                    ) : (
                      <Folder className="w-5 h-5 text-purple-400" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{folder.name}</h3>
                    <p className="text-sm text-gray-400">
                      {folder.designCount} designs · Updated {folder.updatedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-2">
                    {folder.sharedWith.slice(0, 3).map((member, i) => (
                      <div
                        key={member.id}
                        className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 border-2 border-gray-800 flex items-center justify-center text-xs text-white"
                      >
                        {member.name[0]}
                      </div>
                    ))}
                    {folder.sharedWith.length > 3 && (
                      <div className="w-6 h-6 rounded-full bg-gray-700 border-2 border-gray-800 flex items-center justify-center text-xs text-gray-400">
                        +{folder.sharedWith.length - 3}
                      </div>
                    )}
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Members Tab */}
        {activeTab === 'members' && (
          <div className="space-y-2">
            {filteredMembers.map(member => (
              <div
                key={member.id}
                className="flex items-center justify-between p-3 bg-gray-800 rounded-lg hover:bg-gray-750"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-medium">
                    {member.name[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-white">{member.name}</h3>
                      {member.status === 'pending' && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className={`flex items-center gap-1 ${getRoleColor(member.role)}`}>
                    {getRoleIcon(member.role)}
                    <span className="text-sm capitalize">{member.role}</span>
                  </div>
                  <span className="text-sm text-gray-500">{member.lastActive}</span>
                  <button className="p-1 text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === 'activity' && (
          <div className="space-y-3">
            {activities.map(activity => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-800 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="text-white">
                    <span className="font-medium">{activity.user.name}</span>
                    <span className="text-gray-400">
                      {activity.type === 'design_created' && ' created '}
                      {activity.type === 'design_edited' && ' edited '}
                      {activity.type === 'comment_added' && ' commented on '}
                      {activity.type === 'member_joined' && ' joined the '}
                      {activity.type === 'folder_shared' && ' shared '}
                    </span>
                    <span className="font-medium text-purple-400">{activity.target}</span>
                  </p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className="space-y-4">
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium text-white mb-2">Team Name</h3>
              <input
                type="text"
                defaultValue="CR AudioViz AI Team"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            
            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium text-white mb-2">Default Permission</h3>
              <select className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                <option value="viewer">Viewer - Can view only</option>
                <option value="editor">Editor - Can edit designs</option>
                <option value="admin">Admin - Full access</option>
              </select>
            </div>

            <div className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium text-white mb-2">Invite Link</h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value="https://crav-social-graphics.vercel.app/invite/abc123"
                  readOnly
                  className="flex-1 px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-gray-400 text-sm"
                />
                <button
                  onClick={copyInviteLink}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
              <h3 className="font-medium text-red-400 mb-2">Danger Zone</h3>
              <p className="text-sm text-gray-400 mb-3">
                Once you delete a team, there is no going back.
              </p>
              <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
                Delete Team
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Invite Team Member</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email Address</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="viewer">Viewer - Can view designs</option>
                  <option value="editor">Editor - Can edit designs</option>
                  <option value="admin">Admin - Full access</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowInviteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleInvite}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Send Invite
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Folder Modal */}
      {showNewFolderModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Folder</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Folder Name</label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="My New Folder"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowNewFolderModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateFolder}
                  className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                >
                  Create Folder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
