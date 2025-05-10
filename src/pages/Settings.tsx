import React, { useState } from 'react';
import { 
  User, Bell, Shield, Wallet, Layout, HelpCircle,
  ChevronRight, ChevronDown, Mail, Smartphone, AlertCircle, Lock, LogOut, Sun, Globe, DollarSign, BookOpen, MessageCircle, Send
} from 'lucide-react';
import { ProfileSettings } from '../components/Settings/ProfileSettings';
import { useAuth } from '../context/AuthContext';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

type SettingSection = 'profile' | 'notifications' | 'security' | 'preferences' | 'trading' | 'subscription' | 'help';

const SettingCard: React.FC<{ title: string; description: string; children: React.ReactNode }> = ({ title, description, children }) => (
  <div className="relative overflow-hidden rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-lg">
    <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/5 via-transparent to-accent-primary/5" />
    <div className="relative z-10">
      <div className="flex items-center gap-3 p-6 border-b border-white/10">
        <div className="h-8 w-1 bg-gradient-to-b from-accent-primary/50 to-transparent rounded-full" />
        <div className="space-y-1">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <p className="text-sm text-gray-400">{description}</p>
        </div>
      </div>
      <div className="p-6 space-y-6">
        {children}
      </div>
    </div>
  </div>
);

const Switch: React.FC<{ enabled: boolean; onChange: () => void; label: string }> = ({ enabled, onChange, label }) => (
  <TooltipProvider>
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onChange}
          aria-label={label}
          role="switch"
          aria-checked={enabled ? 'true' : 'false'}
          className={
            `relative inline-flex h-7 w-14 items-center rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 border-2 ` +
            (enabled ? 'bg-blue-500 border-blue-500 shadow-lg' : 'bg-gray-700 border-gray-600')
          }
        >
          <span
            className={
              `inline-block h-6 w-6 transform rounded-full bg-white transition-all duration-200 shadow ` +
              (enabled ? 'translate-x-7' : 'translate-x-1')
            }
          />
        </button>
      </TooltipTrigger>
      <TooltipContent>
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  </TooltipProvider>
);

const GlassSelect: React.FC<{
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}> = ({ value, onChange, options, label, className }) => (
  <div className={`relative ${className || ''}`}>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full pl-10 pr-4 py-2 appearance-none bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg focus:border-accent-primary/50 focus:ring-1 focus:ring-accent-primary/20 transition-all duration-200"
      aria-label={label}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
      <ChevronDown className="w-4 h-4" />
    </div>
  </div>
);

const GlassButton: React.FC<{ children: React.ReactNode; onClick?: () => void; className?: string }> = ({ children, onClick, className }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm flex items-center gap-2 rounded-lg border border-white/10 backdrop-blur-xl bg-white/5 text-white transition-all duration-200 ${className || ''}`}
  >
    {children}
  </button>
);

type SettingsType = {
  emailNotifications: boolean;
  pushNotifications: boolean;
  tradeAlerts: boolean;
  marketUpdates: boolean;
  darkMode: boolean;
  compactMode: boolean;
  twoFactor: boolean;
  autoLogout: boolean;
  riskLevel: 'conservative' | 'moderate' | 'aggressive';
  subscriptionTier: 'basic' | 'pro' | 'premium';
  language: string;
  timezone: string;
  currency: string;
};

const CardGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{children}</div>
);

export const Settings: React.FC = () => {
  const [activeSection, setActiveSection] = useState<SettingSection>('profile');
  const { user } = useAuth();

  const [settings, setSettings] = useState<SettingsType>({
    emailNotifications: true,
    pushNotifications: true,
    tradeAlerts: true,
    marketUpdates: true,
    darkMode: true,
    compactMode: false,
    twoFactor: false,
    autoLogout: true,
    riskLevel: 'moderate',
    subscriptionTier: 'basic',
    language: 'en',
    timezone: 'UTC+5:30',
    currency: 'INR'
  });

  const toggleSetting = (key: keyof SettingsType) => {
    setSettings((prev: SettingsType) => ({ ...prev, [key]: !prev[key] }));
  };

  const updateSetting = <K extends keyof SettingsType>(key: K, value: SettingsType[K]) => {
    setSettings((prev: SettingsType) => ({ ...prev, [key]: value }));
  };

  const menuItems: Array<{ id: SettingSection; label: string; icon: React.ElementType }> = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'preferences', label: 'Preferences', icon: Layout },
    { id: 'subscription', label: 'Subscription', icon: Wallet },
    { id: 'help', label: 'Help & Support', icon: HelpCircle }
  ];

  // Subscription plans data
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 'Free',
      features: [
        'Access to basic features',
        'Community support',
        'Limited analytics',
      ],
      accent: 'border-gray-400',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '₹499/mo',
      features: [
        'All Basic features',
        'Advanced analytics',
        'Priority support',
        'Custom alerts',
      ],
      accent: 'border-blue-500',
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '₹999/mo',
      features: [
        'All Pro features',
        '1-on-1 expert calls',
        'Early access to new features',
        'Unlimited alerts',
      ],
      accent: 'border-yellow-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background-primary to-background-secondary">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-2">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full px-4 py-3 rounded-lg text-left flex items-center gap-3 transition-colors duration-200 border ${
                    activeSection === item.id
                      ? 'bg-accent-primary/90 text-white border-accent-primary shadow-md'
                      : 'bg-white/5 text-gray-400 border-transparent hover:bg-accent-primary/10 hover:text-accent-primary'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${
                    activeSection === item.id ? 'text-white' : 'text-gray-400 group-hover:text-accent-primary'
                  }`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-8">
                <div className="relative rounded-2xl border border-white/10 bg-white/10 p-8 flex flex-col md:flex-row items-center gap-8 shadow-lg">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 rounded-full bg-accent-primary/20 flex items-center justify-center">
                      <User className="w-12 h-12 text-accent-primary" />
                    </div>
                  </div>
                  <div className="flex-1 w-full">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div>
                        <div className="text-2xl font-bold text-white">{user?.name || 'User Name'}</div>
                        <div className="text-gray-400">{user?.email || 'user@email.com'}</div>
                      </div>
                      <GlassButton>
                        <span>Edit Profile</span>
                        <ChevronRight className="w-4 h-4 text-accent-primary" />
                      </GlassButton>
                    </div>
                    <div className="mt-6">
                      <ProfileSettings user={user} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white mb-2">Notification Preferences</h2>
                <CardGrid>
                  <SettingCard title="Email Notifications" description="Get important updates via email.">
                    <div className="flex items-center gap-4">
                      <Mail className="w-6 h-6 text-accent-primary" />
                      <Switch enabled={settings.emailNotifications} onChange={() => toggleSetting('emailNotifications')} label="Toggle email notifications" />
                      <span className="text-sm text-gray-400">{settings.emailNotifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </SettingCard>
                  <SettingCard title="Push Notifications" description="Receive push alerts on your device.">
                    <div className="flex items-center gap-4">
                      <Smartphone className="w-6 h-6 text-accent-primary" />
                      <Switch enabled={settings.pushNotifications} onChange={() => toggleSetting('pushNotifications')} label="Toggle push notifications" />
                      <span className="text-sm text-gray-400">{settings.pushNotifications ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </SettingCard>
                  <SettingCard title="Trade Alerts" description="Get notified about your trades.">
                    <div className="flex items-center gap-4">
                      <AlertCircle className="w-6 h-6 text-accent-primary" />
                      <Switch enabled={settings.tradeAlerts} onChange={() => toggleSetting('tradeAlerts')} label="Toggle trade alerts" />
                      <span className="text-sm text-gray-400">{settings.tradeAlerts ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </SettingCard>
                </CardGrid>
              </div>
            )}

            {/* Security Section */}
            {activeSection === 'security' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white mb-2">Security Settings</h2>
                <CardGrid>
                  <SettingCard title="Two-Factor Authentication" description="Add an extra layer of security.">
                    <div className="flex items-center gap-4">
                      <Lock className="w-6 h-6 text-accent-primary" />
                      <Switch enabled={settings.twoFactor} onChange={() => toggleSetting('twoFactor')} label="Toggle two-factor authentication" />
                      <span className="text-sm text-gray-400">{settings.twoFactor ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </SettingCard>
                  <SettingCard title="Auto Logout" description="Automatically log out after inactivity.">
                    <div className="flex items-center gap-4">
                      <LogOut className="w-6 h-6 text-accent-primary" />
                      <Switch enabled={settings.autoLogout} onChange={() => toggleSetting('autoLogout')} label="Toggle auto logout" />
                      <span className="text-sm text-gray-400">{settings.autoLogout ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </SettingCard>
                  <SettingCard title="Password" description="Change your account password.">
                    <div className="flex items-center gap-4">
                      <Lock className="w-6 h-6 text-accent-primary" />
                      <GlassButton>
                        <span>Change Password</span>
                        <ChevronRight className="w-4 h-4" />
                      </GlassButton>
                    </div>
                  </SettingCard>
                </CardGrid>
              </div>
            )}

            {/* Preferences Section */}
            {activeSection === 'preferences' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white mb-2">App Preferences</h2>
                <CardGrid>
                  <SettingCard title="Theme" description="Switch between light and dark mode.">
                    <div className="flex items-center gap-4">
                      <Sun className="w-6 h-6 text-accent-primary" />
                      <Switch enabled={settings.darkMode} onChange={() => toggleSetting('darkMode')} label="Toggle dark mode" />
                      <span className="text-sm text-gray-400">{settings.darkMode ? 'Dark' : 'Light'}</span>
                    </div>
                  </SettingCard>
                  <SettingCard title="Compact Mode" description="Use a more compact layout.">
                    <div className="flex items-center gap-4">
                      <Layout className="w-6 h-6 text-accent-primary" />
                      <Switch enabled={settings.compactMode} onChange={() => toggleSetting('compactMode')} label="Toggle compact mode" />
                      <span className="text-sm text-gray-400">{settings.compactMode ? 'Enabled' : 'Disabled'}</span>
                    </div>
                  </SettingCard>
                  <SettingCard title="Currency" description="Set your preferred trading currency.">
                    <div className="flex items-center gap-4">
                      <DollarSign className="w-6 h-6 text-accent-primary" />
                      <GlassSelect
                        value={settings.currency}
                        onChange={(value) => updateSetting('currency', value)}
                        options={[
                          { value: 'INR', label: 'Indian Rupee (₹)' },
                          { value: 'USD', label: 'US Dollar ($)' },
                          { value: 'EUR', label: 'Euro (€)' }
                        ]}
                        label="Select currency"
                      />
                    </div>
                  </SettingCard>
                  <SettingCard title="Language" description="Set your preferred language.">
                    <div className="flex items-center gap-4">
                      <Globe className="w-6 h-6 text-accent-primary" />
                      <GlassSelect
                        value={settings.language}
                        onChange={(value) => updateSetting('language', value)}
                        options={[
                          { value: 'en', label: 'English' },
                          { value: 'hi', label: 'Hindi' },
                          { value: 'ta', label: 'Tamil' }
                        ]}
                        label="Select language"
                      />
                    </div>
                  </SettingCard>
                </CardGrid>
              </div>
            )}

            {/* Subscription Section (already improved) */}
            {activeSection === 'subscription' && (
              <SettingCard
                title="Subscription Management"
                description="View and manage your subscription plan"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {plans.map(plan => (
                    <div
                      key={plan.id}
                      className={`relative rounded-2xl border-2 ${plan.accent} bg-white/10 p-6 flex flex-col items-center shadow-lg transition-all duration-300 ${settings.subscriptionTier === plan.id ? 'ring-2 ring-accent-primary scale-105' : 'hover:scale-105'}`}
                    >
                      {settings.subscriptionTier === plan.id && (
                        <span className="absolute top-4 right-4 bg-accent-primary text-white text-xs px-3 py-1 rounded-full font-semibold shadow">Current Plan</span>
                      )}
                      <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                      <div className="text-3xl font-extrabold mb-4 text-accent-primary">{plan.price}</div>
                      <ul className="mb-6 space-y-2 text-sm text-gray-200 text-left w-full">
                        {plan.features.map((feature, idx) => (
                          <li key={idx} className="flex items-center gap-2">
                            <span className="inline-block w-2 h-2 bg-accent-primary rounded-full" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                      {settings.subscriptionTier !== plan.id ? (
                        <button
                          className="w-full py-2 rounded-lg bg-accent-primary text-white font-semibold transition-all duration-200 hover:bg-accent-primary/80"
                          onClick={() => updateSetting('subscriptionTier', plan.id as 'basic' | 'pro' | 'premium')}
                        >
                          {plan.id === 'basic' ? 'Downgrade' : 'Upgrade'}
                        </button>
                      ) : (
                        <button
                          className="w-full py-2 rounded-lg bg-gray-400 text-white font-semibold cursor-not-allowed opacity-70"
                          disabled
                        >
                          Selected
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </SettingCard>
            )}

            {/* Help & Support Section */}
            {activeSection === 'help' && (
              <div className="space-y-8">
                <h2 className="text-3xl font-extrabold text-white flex items-center gap-3 mb-4">
                  <span className="inline-block w-1 h-8 bg-accent-primary rounded-full" />
                  Help & Support
                </h2>
                <CardGrid>
                  <SettingCard title="Documentation" description="Access guides and tutorials.">
                    <div className="flex items-center gap-4">
                      <BookOpen className="w-6 h-6 text-accent-primary" />
                      <GlassButton className="bg-accent-primary text-white shadow hover:brightness-110">
                        <span>View Documentation</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </GlassButton>
                    </div>
                  </SettingCard>
                  <SettingCard title="Contact Support" description="Get in touch with our team.">
                    <div className="flex items-center gap-4">
                      <MessageCircle className="w-6 h-6 text-accent-primary" />
                      <GlassButton className="bg-accent-primary text-white shadow hover:brightness-110">
                        <span>Contact Support</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </GlassButton>
                    </div>
                  </SettingCard>
                  <SettingCard title="Feedback" description="Share your thoughts and suggestions.">
                    <div className="flex items-center gap-4">
                      <Send className="w-6 h-6 text-accent-primary" />
                      <GlassButton className="bg-accent-primary text-white shadow hover:brightness-110">
                        <span>Send Feedback</span>
                        <ChevronRight className="w-4 h-4 text-white" />
                      </GlassButton>
                    </div>
                  </SettingCard>
                </CardGrid>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};