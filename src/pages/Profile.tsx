import { User, Phone, MapPin, Bell, Shield, CreditCard, LogOut } from "lucide-react"
import { useState } from "react"

interface UserProfile {
  name: string
  email: string
  phone: string
  company: string
  address: string
  avatar?: string
}

const initialProfile: UserProfile = {
  name: "John Doe",
  email: "john.doe@example.com", 
  phone: "+1 (555) 123-4567",
  company: "Acme Corp",
  address: "123 Business St, City, State 12345"
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile>(initialProfile)
  const [isEditing, setIsEditing] = useState(false)
  const [editProfile, setEditProfile] = useState<UserProfile>(initialProfile)
  const [notifications, setNotifications] = useState({
    emailReports: true,
    transactionAlerts: true,
    securityUpdates: true,
    marketingEmails: false
  })

  const handleSave = () => {
    setProfile(editProfile)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditProfile(profile)
    setIsEditing(false)
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="mt-1 text-gray-400">Manage your account settings and preferences</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-1">
            <div className="neo-card p-6 text-center">
              <div className="w-24 h-24 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">{profile.name}</h2>
              <p className="text-gray-400">{profile.email}</p>
              <p className="text-gray-500 text-sm mt-1">{profile.company}</p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{profile.phone}</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-400">
                  <MapPin className="w-4 h-4" />
                  <span className="text-sm">{profile.address}</span>
                </div>
              </div>

              <button className="w-full mt-6 px-4 py-2 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white font-medium rounded-lg hover:opacity-90 transition-opacity">
                Change Avatar
              </button>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Information */}
            <div className="neo-card">
              <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Personal Information</h3>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="px-4 py-2 text-[#2BD1FF] hover:text-[#2BD1FF]/80 hover:bg-slate-800 rounded-lg transition-colors"
                >
                  {isEditing ? 'Cancel' : 'Edit'}
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Full Name</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editProfile.name}
                        onChange={(e) => setEditProfile({...editProfile, name: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]"
                      />
                    ) : (
                      <p className="text-white py-2">{profile.name}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editProfile.email}
                        onChange={(e) => setEditProfile({...editProfile, email: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]"
                      />
                    ) : (
                      <p className="text-white py-2">{profile.email}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editProfile.phone}
                        onChange={(e) => setEditProfile({...editProfile, phone: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]"
                      />
                    ) : (
                      <p className="text-white py-2">{profile.phone}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Company</label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editProfile.company}
                        onChange={(e) => setEditProfile({...editProfile, company: e.target.value})}
                        className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]"
                      />
                    ) : (
                      <p className="text-white py-2">{profile.company}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">Address</label>
                  {isEditing ? (
                    <textarea
                      value={editProfile.address}
                      onChange={(e) => setEditProfile({...editProfile, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#2BD1FF]"
                    />
                  ) : (
                    <p className="text-white py-2">{profile.address}</p>
                  )}
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      onClick={handleCancel}
                      className="px-4 py-2 text-gray-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSave}
                      className="px-4 py-2 bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] text-white font-medium rounded-lg hover:opacity-90 transition-opacity"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="neo-card">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Notification Preferences</h3>
              </div>
              
              <div className="p-6 space-y-4">
                {Object.entries(notifications).map(([key, enabled]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Bell className="w-4 h-4 text-gray-400" />
                      <div>
                        <p className="text-white font-medium">
                          {key === 'emailReports' && 'Email Reports'}
                          {key === 'transactionAlerts' && 'Transaction Alerts'}
                          {key === 'securityUpdates' && 'Security Updates'}
                          {key === 'marketingEmails' && 'Marketing Emails'}
                        </p>
                        <p className="text-gray-400 text-sm">
                          {key === 'emailReports' && 'Receive monthly financial reports via email'}
                          {key === 'transactionAlerts' && 'Get notified of new transactions'}
                          {key === 'securityUpdates' && 'Important security and account updates'}
                          {key === 'marketingEmails' && 'Product updates and promotional content'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setNotifications({...notifications, [key]: !enabled})}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        enabled ? 'bg-[#2BD1FF]' : 'bg-gray-600'
                      }`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                        enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Security & Account */}
            <div className="neo-card">
              <div className="p-6 border-b border-slate-700">
                <h3 className="text-lg font-semibold text-white">Security & Account</h3>
              </div>
              
              <div className="p-6 space-y-4">
                <button className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-lg transition-colors group">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-gray-400 group-hover:text-[#2BD1FF]" />
                    <div className="text-left">
                      <p className="text-white font-medium">Change Password</p>
                      <p className="text-gray-400 text-sm">Update your account password</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-[#2BD1FF]">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 rounded-lg transition-colors group">
                  <div className="flex items-center space-x-3">
                    <CreditCard className="w-5 h-5 text-gray-400 group-hover:text-[#2BD1FF]" />
                    <div className="text-left">
                      <p className="text-white font-medium">Billing & Subscription</p>
                      <p className="text-gray-400 text-sm">Manage your subscription and payment methods</p>
                    </div>
                  </div>
                  <span className="text-gray-400 group-hover:text-[#2BD1FF]">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 hover:bg-red-500/10 rounded-lg transition-colors group">
                  <div className="flex items-center space-x-3">
                    <LogOut className="w-5 h-5 text-red-400" />
                    <div className="text-left">
                      <p className="text-red-400 font-medium">Sign Out</p>
                      <p className="text-gray-400 text-sm">Sign out of your account</p>
                    </div>
                  </div>
                  <span className="text-red-400">→</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
