import React, { useState } from 'react';
import { User, Mail, Phone, MapPin } from 'lucide-react';
import type { User as UserType } from '../../types/auth';

interface ProfileSettingsProps {
  user: UserType | null;
}

export const ProfileSettings: React.FC<ProfileSettingsProps> = ({ user }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    location: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle profile update
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <div className="w-20 h-20 rounded-full bg-accent-primary/20 flex items-center justify-center">
          <User className="w-10 h-10 text-accent-primary" />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{user?.name}</h3>
          <p className="text-gray-400">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm text-gray-400">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Email</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm text-gray-400">Location</label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full pl-10 pr-4 py-2 glass rounded-lg text-white focus:ring-2 focus:ring-accent-primary"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full glass-button py-2 px-4 flex items-center justify-center space-x-2"
        >
          Save Changes
        </button>
      </form>
    </div>
  );
};