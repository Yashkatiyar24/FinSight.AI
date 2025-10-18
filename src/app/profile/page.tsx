"use client"

import Navigation from "@/components/Navigation"
import { Building2, Mail, Globe, Clock, Key, CheckCircle, Copy } from "lucide-react"

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <Navigation />
      
      <div className="mx-auto max-w-[1200px] p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white">Profile & Settings</h1>
          <p className="mt-1 text-gray-400">Manage your organization and preferences</p>
        </div>
        
        {/* Organization Details */}
        <div className="neo-card mb-6 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">Organization Details</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                <Building2 className="mb-1 mr-2 inline h-4 w-4" />
                Organization Name
              </label>
              <input
                type="text"
                defaultValue="Acme Corporation"
                className="w-full rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#2BD1FF] focus:outline-none"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                <Mail className="mb-1 mr-2 inline h-4 w-4" />
                Email Address
              </label>
              <input
                type="email"
                defaultValue="admin@acme.com"
                className="w-full rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#2BD1FF] focus:outline-none"
              />
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                <Globe className="mb-1 mr-2 inline h-4 w-4" />
                Currency
              </label>
              <select className="w-full rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white focus:border-[#2BD1FF] focus:outline-none">
                <option>USD - US Dollar</option>
                <option>EUR - Euro</option>
                <option>GBP - British Pound</option>
                <option>AUD - Australian Dollar</option>
              </select>
            </div>
            
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                <Clock className="mb-1 mr-2 inline h-4 w-4" />
                Timezone
              </label>
              <select className="w-full rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-4 py-3 text-sm text-white focus:border-[#2BD1FF] focus:outline-none">
                <option>UTC-8 (Pacific Time)</option>
                <option>UTC-5 (Eastern Time)</option>
                <option>UTC+0 (GMT)</option>
                <option>UTC+10 (Australian Eastern)</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <button className="neo-button rounded-lg bg-gradient-to-r from-[#2BD1FF] to-[#7A5CFF] px-6 py-2 text-sm font-semibold text-white transition-all hover:shadow-[0_0_20px_rgba(43,209,255,0.4)]">
              Save Changes
            </button>
          </div>
        </div>
        
        {/* User Preferences */}
        <div className="neo-card mb-6 p-6">
          <h2 className="mb-6 text-xl font-semibold text-white">User Preferences</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-lg bg-[#141925]/50 p-4">
              <div>
                <p className="text-sm font-medium text-white">Dark Mode</p>
                <p className="text-xs text-gray-400">Use dark theme across the dashboard</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2BD1FF] peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between rounded-lg bg-[#141925]/50 p-4">
              <div>
                <p className="text-sm font-medium text-white">Round GST Calculations</p>
                <p className="text-xs text-gray-400">Round GST amounts to nearest cent</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2BD1FF] peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between rounded-lg bg-[#141925]/50 p-4">
              <div>
                <p className="text-sm font-medium text-white">Show Low-Confidence Badge</p>
                <p className="text-xs text-gray-400">Display confidence scores below 90%</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" defaultChecked />
                <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2BD1FF] peer-checked:after:translate-x-full"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between rounded-lg bg-[#141925]/50 p-4">
              <div>
                <p className="text-sm font-medium text-white">Email Notifications</p>
                <p className="text-xs text-gray-400">Receive weekly summary reports</p>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input type="checkbox" className="peer sr-only" />
                <div className="peer h-6 w-11 rounded-full bg-gray-700 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[#2BD1FF] peer-checked:after:translate-x-full"></div>
              </label>
            </div>
          </div>
        </div>
        
        {/* API Keys */}
        <div className="neo-card p-6">
          <div className="mb-6 flex items-center gap-3">
            <Key className="h-6 w-6 text-[#FFD700]" />
            <h2 className="text-xl font-semibold text-white">API Keys</h2>
          </div>
          
          <div className="mb-4 rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] p-4">
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-[#10B981]" />
                <span className="text-sm font-medium text-white">Production API Key</span>
              </div>
              <span className="rounded-full bg-[#10B981]/20 px-2 py-1 text-xs text-[#10B981]">Active</span>
            </div>
            <div className="flex items-center gap-3">
              <code className="flex-1 rounded bg-[#0F1218] px-3 py-2 font-mono text-xs text-gray-400">
                fs_prod_xxxxxxxxxxxxxxxxxxxxxxxx
              </code>
              <button className="rounded p-2 transition-all hover:bg-[#2BD1FF]/20">
                <Copy className="h-4 w-4 text-gray-400 hover:text-[#2BD1FF]" />
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-500">Created on Oct 1, 2025 • Last used 2 hours ago</p>
          </div>
          
          <button className="neo-button rounded-lg border border-[rgba(43,209,255,0.2)] bg-[#141925] px-6 py-2 text-sm font-semibold text-white transition-all hover:border-[#2BD1FF] hover:bg-[#2BD1FF]/10">
            Generate New Key
          </button>
        </div>
      </div>
    </div>
  )
}