'use client'

import { useState } from 'react'
import { 
  History, Clock, RotateCcw, Eye, Download, Trash2,
  ChevronRight, Star, GitBranch, Copy, Check,
  User, Calendar, Layers, Maximize2, ArrowLeft
} from 'lucide-react'

interface DesignVersion {
  id: string
  versionNumber: number
  thumbnail: string
  createdAt: string
  createdBy: {
    name: string
    avatar: string
  }
  changes: string[]
  size: { width: number; height: number }
  fileSize: string
  isStarred: boolean
  isCurrent: boolean
}

interface VersionHistoryProps {
  designId: string
  onRestoreVersion?: (version: DesignVersion) => void
  onPreviewVersion?: (version: DesignVersion) => void
  onClose?: () => void
}

const DEMO_VERSIONS: DesignVersion[] = [
  {
    id: 'v8',
    versionNumber: 8,
    thumbnail: '',
    createdAt: 'Just now',
    createdBy: { name: 'You', avatar: '' },
    changes: ['Added CTA button', 'Changed headline font'],
    size: { width: 1080, height: 1080 },
    fileSize: '2.4 MB',
    isStarred: false,
    isCurrent: true
  },
  {
    id: 'v7',
    versionNumber: 7,
    thumbnail: '',
    createdAt: '2 hours ago',
    createdBy: { name: 'Sarah Chen', avatar: '' },
    changes: ['Updated brand colors', 'Adjusted spacing'],
    size: { width: 1080, height: 1080 },
    fileSize: '2.3 MB',
    isStarred: true,
    isCurrent: false
  },
  {
    id: 'v6',
    versionNumber: 6,
    thumbnail: '',
    createdAt: '5 hours ago',
    createdBy: { name: 'You', avatar: '' },
    changes: ['Added product image', 'Changed background gradient'],
    size: { width: 1080, height: 1080 },
    fileSize: '2.5 MB',
    isStarred: false,
    isCurrent: false
  },
  {
    id: 'v5',
    versionNumber: 5,
    thumbnail: '',
    createdAt: 'Yesterday',
    createdBy: { name: 'Mike Johnson', avatar: '' },
    changes: ['Resized to 1080x1080', 'Added logo'],
    size: { width: 1080, height: 1080 },
    fileSize: '2.1 MB',
    isStarred: false,
    isCurrent: false
  },
  {
    id: 'v4',
    versionNumber: 4,
    thumbnail: '',
    createdAt: '2 days ago',
    createdBy: { name: 'You', avatar: '' },
    changes: ['Changed layout to centered', 'Added discount badge'],
    size: { width: 1200, height: 628 },
    fileSize: '1.9 MB',
    isStarred: true,
    isCurrent: false
  },
  {
    id: 'v3',
    versionNumber: 3,
    thumbnail: '',
    createdAt: '3 days ago',
    createdBy: { name: 'Sarah Chen', avatar: '' },
    changes: ['Updated copy text', 'Fixed typo in headline'],
    size: { width: 1200, height: 628 },
    fileSize: '1.8 MB',
    isStarred: false,
    isCurrent: false
  },
  {
    id: 'v2',
    versionNumber: 2,
    thumbnail: '',
    createdAt: '4 days ago',
    createdBy: { name: 'You', avatar: '' },
    changes: ['Added initial design elements'],
    size: { width: 1200, height: 628 },
    fileSize: '1.5 MB',
    isStarred: false,
    isCurrent: false
  },
  {
    id: 'v1',
    versionNumber: 1,
    thumbnail: '',
    createdAt: '5 days ago',
    createdBy: { name: 'You', avatar: '' },
    changes: ['Initial design created'],
    size: { width: 1200, height: 628 },
    fileSize: '0.5 MB',
    isStarred: false,
    isCurrent: false
  },
]

export default function VersionHistory({ designId, onRestoreVersion, onPreviewVersion, onClose }: VersionHistoryProps) {
  const [versions, setVersions] = useState<DesignVersion[]>(DEMO_VERSIONS)
  const [selectedVersion, setSelectedVersion] = useState<DesignVersion | null>(null)
  const [compareMode, setCompareMode] = useState(false)
  const [compareVersions, setCompareVersions] = useState<[DesignVersion | null, DesignVersion | null]>([null, null])
  const [filter, setFilter] = useState<'all' | 'starred' | 'mine'>('all')
  const [copied, setCopied] = useState(false)

  const filteredVersions = versions.filter(v => {
    if (filter === 'starred') return v.isStarred
    if (filter === 'mine') return v.createdBy.name === 'You'
    return true
  })

  const handleToggleStar = (versionId: string) => {
    setVersions(versions.map(v => 
      v.id === versionId ? { ...v, isStarred: !v.isStarred } : v
    ))
  }

  const handleRestore = (version: DesignVersion) => {
    // Create a new version from restored state
    const newVersion: DesignVersion = {
      ...version,
      id: `v${versions.length + 1}`,
      versionNumber: versions.length + 1,
      createdAt: 'Just now',
      createdBy: { name: 'You', avatar: '' },
      changes: [`Restored from version ${version.versionNumber}`],
      isCurrent: true
    }
    
    setVersions([
      newVersion,
      ...versions.map(v => ({ ...v, isCurrent: false }))
    ])
    
    onRestoreVersion?.(version)
    setSelectedVersion(null)
  }

  const handleCompareSelect = (version: DesignVersion) => {
    if (!compareVersions[0]) {
      setCompareVersions([version, null])
    } else if (!compareVersions[1] && version.id !== compareVersions[0].id) {
      setCompareVersions([compareVersions[0], version])
    }
  }

  const copyVersionLink = () => {
    if (selectedVersion) {
      navigator.clipboard.writeText(`https://crav-social-graphics.vercel.app/design/${designId}/v/${selectedVersion.versionNumber}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedVersion ? (
            <button
              onClick={() => setSelectedVersion(null)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            <History className="w-5 h-5 text-purple-400" />
          )}
          <h2 className="font-semibold text-white">
            {selectedVersion ? `Version ${selectedVersion.versionNumber}` : 'Version History'}
          </h2>
          {!selectedVersion && (
            <span className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded-full">
              {versions.length} versions
            </span>
          )}
        </div>
        
        {!selectedVersion && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCompareMode(!compareMode)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm transition-colors ${
                compareMode ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-300 hover:text-white'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              Compare
            </button>
            
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All Versions</option>
              <option value="starred">Starred</option>
              <option value="mine">My Edits</option>
            </select>
          </div>
        )}
      </div>

      {/* Compare Mode Banner */}
      {compareMode && !selectedVersion && (
        <div className="p-3 bg-purple-500/10 border-b border-purple-500/30">
          <div className="flex items-center justify-between">
            <p className="text-sm text-purple-300">
              {!compareVersions[0] 
                ? 'Select the first version to compare' 
                : !compareVersions[1]
                  ? 'Select the second version to compare'
                  : `Comparing v${compareVersions[0].versionNumber} with v${compareVersions[1].versionNumber}`
              }
            </p>
            {(compareVersions[0] || compareVersions[1]) && (
              <button
                onClick={() => setCompareVersions([null, null])}
                className="text-sm text-purple-400 hover:text-purple-300"
              >
                Reset
              </button>
            )}
          </div>
          
          {compareVersions[0] && compareVersions[1] && (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm font-medium text-white mb-1">Version {compareVersions[0].versionNumber}</p>
                <p className="text-xs text-gray-400">{compareVersions[0].createdAt} by {compareVersions[0].createdBy.name}</p>
              </div>
              <div className="bg-gray-800 rounded-lg p-3">
                <p className="text-sm font-medium text-white mb-1">Version {compareVersions[1].versionNumber}</p>
                <p className="text-xs text-gray-400">{compareVersions[1].createdAt} by {compareVersions[1].createdBy.name}</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Version Detail View */}
      {selectedVersion ? (
        <div className="p-4">
          {/* Preview */}
          <div className="aspect-square bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 rounded-lg mb-4 flex items-center justify-center">
            <span className="text-white/50 text-lg">v{selectedVersion.versionNumber}</span>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <User className="w-3 h-3" />
                Created by
              </div>
              <p className="text-white text-sm font-medium">{selectedVersion.createdBy.name}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Calendar className="w-3 h-3" />
                Created
              </div>
              <p className="text-white text-sm font-medium">{selectedVersion.createdAt}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Maximize2 className="w-3 h-3" />
                Dimensions
              </div>
              <p className="text-white text-sm font-medium">{selectedVersion.size.width} × {selectedVersion.size.height}</p>
            </div>
            <div className="p-3 bg-gray-800 rounded-lg">
              <div className="flex items-center gap-2 text-gray-400 text-xs mb-1">
                <Layers className="w-3 h-3" />
                File Size
              </div>
              <p className="text-white text-sm font-medium">{selectedVersion.fileSize}</p>
            </div>
          </div>

          {/* Changes */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Changes in this version</h3>
            <ul className="space-y-1">
              {selectedVersion.changes.map((change, i) => (
                <li key={i} className="flex items-center gap-2 text-sm text-white">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  {change}
                </li>
              ))}
            </ul>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!selectedVersion.isCurrent && (
              <button
                onClick={() => handleRestore(selectedVersion)}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restore This Version
              </button>
            )}
            <button
              onClick={() => onPreviewVersion?.(selectedVersion)}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={copyVersionLink}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>
      ) : (
        /* Versions List */
        <div className="max-h-96 overflow-y-auto">
          {filteredVersions.map((version, index) => (
            <div
              key={version.id}
              onClick={() => compareMode ? handleCompareSelect(version) : setSelectedVersion(version)}
              className={`flex items-center gap-3 p-3 border-b border-gray-800 cursor-pointer transition-colors ${
                compareMode && (compareVersions[0]?.id === version.id || compareVersions[1]?.id === version.id)
                  ? 'bg-purple-500/20'
                  : 'hover:bg-gray-800'
              }`}
            >
              {/* Thumbnail */}
              <div className={`w-16 h-16 rounded-lg flex-shrink-0 flex items-center justify-center relative ${
                version.isCurrent 
                  ? 'bg-gradient-to-br from-purple-600 to-pink-500' 
                  : 'bg-gradient-to-br from-gray-700 to-gray-600'
              }`}>
                <span className="text-white/70 text-xs">v{version.versionNumber}</span>
                {version.isCurrent && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-white">Version {version.versionNumber}</span>
                  {version.isCurrent && (
                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full">
                      Current
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 truncate">
                  {version.changes[0]}
                </p>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  <span>{version.createdAt}</span>
                  <span>•</span>
                  <span>{version.createdBy.name}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleToggleStar(version.id)
                  }}
                  className={`p-2 rounded-lg transition-colors ${
                    version.isStarred ? 'text-yellow-400' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Star className={`w-4 h-4 ${version.isStarred ? 'fill-current' : ''}`} />
                </button>
                
                {!version.isCurrent && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRestore(version)
                    }}
                    className="p-2 text-gray-500 hover:text-white rounded-lg transition-colors"
                    title="Restore this version"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Timeline indicator */}
      {!selectedVersion && (
        <div className="p-4 border-t border-gray-700 bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-400">
            <span>Showing {filteredVersions.length} of {versions.length} versions</span>
            <span>Auto-saved every edit</span>
          </div>
        </div>
      )}
    </div>
  )
}
