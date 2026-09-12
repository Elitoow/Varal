'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/components/auth/AuthProvider'
import { SignInModal } from '@/components/auth/SignInModal'
import { SignUpModal } from '@/components/auth/SignUpModal'
import { Feed } from '@/components/feed/Feed'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'
import { Stories } from '@/components/feed/Stories'
import { CollectionsGrid } from '@/components/collections/CollectionsGrid'
import { Chat } from '@/components/chat/Chat'
import { PinIcon, HomeIcon, FolderIcon, MessageCircleIcon, UserIcon } from 'lucide-react'

type Tab = 'feed' | 'collections' | 'messages' | 'profile'

export default function VaralPage() {
  const { user, loading } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('feed')
  const [showSignIn, setShowSignIn] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f4efe2] flex items-center justify-center">
        <div className="text-center">
          <PinIcon className="w-16 h-16 mx-auto mb-4 text-[#e63946] animate-bounce" />
          <p className="text-gray-600">Carregando VARAL...</p>
        </div>
      </div>
    )
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'feed':
        return (
          <div className="space-y-6">
            <Stories />
            <Feed />
          </div>
        )
      case 'collections':
        return <CollectionsGrid userId={user?.id} />
      case 'messages':
        return user ? <Chat /> : (
          <div className="text-center py-12">
            <MessageCircleIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Faça login para ver mensagens</h3>
            <button
              onClick={() => setShowSignIn(true)}
              className="text-[#e63946] hover:underline"
            >
              Entrar
            </button>
          </div>
        )
      case 'profile':
        return user ? (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Perfil em construção</h3>
            <p className="text-gray-600">Em breve você poderá personalizar seu perfil!</p>
          </div>
        ) : (
          <div className="text-center py-12">
            <UserIcon className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-xl font-bold text-gray-700 mb-2">Faça login para ver seu perfil</h3>
            <button
              onClick={() => setShowSignIn(true)}
              className="text-[#e63946] hover:underline"
            >
              Entrar
            </button>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-[#f4efe2]">
      <Header
        user={user}
        onSignIn={() => setShowSignIn(true)}
        onSignUp={() => setShowSignUp(true)}
      />

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navigation Tabs */}
        <nav className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setActiveTab('feed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              activeTab === 'feed'
                ? 'bg-[#e63946] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <HomeIcon className="w-5 h-5" />
            Feed
          </button>
          <button
            onClick={() => setActiveTab('collections')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              activeTab === 'collections'
                ? 'bg-[#e63946] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FolderIcon className="w-5 h-5" />
            Coleções
          </button>
          <button
            onClick={() => setActiveTab('messages')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              activeTab === 'messages'
                ? 'bg-[#e63946] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <MessageCircleIcon className="w-5 h-5" />
            Mensagens
          </button>
          <button
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-all ${
              activeTab === 'profile'
                ? 'bg-[#e63946] text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            <UserIcon className="w-5 h-5" />
            Perfil
          </button>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            {renderContent()}
          </div>
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </div>
      </div>

      {showSignIn && (
        <SignInModal
          onClose={() => setShowSignIn(false)}
          onSuccess={() => {
            setShowSignIn(false)
            window.location.reload()
          }}
        />
      )}

      {showSignUp && (
        <SignUpModal
          onClose={() => setShowSignUp(false)}
          onSuccess={() => {
            setShowSignUp(false)
            window.location.reload()
          }}
        />
      )}
    </div>
  )
}
