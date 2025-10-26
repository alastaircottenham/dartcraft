import { useTheme } from '../contexts/ThemeContext';

export default function SettingsPage() {
  const { settings, updateSettings } = useTheme();

  const handleSettingChange = (key: keyof typeof settings, value: any) => {
    updateSettings({ [key]: value });
  };

  const colors = [
    '#000000', '#FF0000', '#00FF00', '#0000FF', 
    '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500'
  ];

  const strokeWidths = [2, 4, 6, 8, 12];

  return (
    <div className="relative min-h-full p-4">
      {/* Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-pink-50/30 dark:from-blue-900/10 dark:via-purple-900/10 dark:to-pink-900/10 pointer-events-none" />
      
      <div className="relative space-y-6">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 dark:from-blue-500/20 dark:to-purple-500/20 rounded-3xl blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/70 dark:bg-gray-800/70 rounded-2xl p-6 border border-white/20 dark:border-gray-700/50 shadow-xl dark:shadow-2xl">
            <div className="inline-block relative mb-2">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-2xl rounded-full -z-10" />
              <h2 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight pb-1">
                Settings
              </h2>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-lg font-medium">
              Customize your Song Files experience
            </p>
          </div>
        </div>

        {/* Theme Settings */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/10 to-blue-500/10 blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">🎨</span>
              Appearance
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-3">
                  Theme
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="backdrop-blur-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-600 rounded-xl w-full px-4 py-3 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-ios-blue transition-all"
                >
                  <option value="system">System</option>
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Annotation Settings */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">✏️</span>
              Annotations
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-3">
                  Default Stroke Color
                </label>
                <div className="flex flex-wrap gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => handleSettingChange('defaultStrokeColor', color)}
                      className={`w-12 h-12 rounded-xl border-2 transition-all transform hover:scale-110 ${
                        settings.defaultStrokeColor === color 
                          ? 'border-ios-blue ring-2 ring-ios-blue/50 shadow-lg' 
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-3">
                  Default Stroke Width
                </label>
                <div className="flex flex-wrap gap-3">
                  {strokeWidths.map(width => (
                    <button
                      key={width}
                      onClick={() => handleSettingChange('defaultStrokeWidth', width)}
                      className={`p-3 rounded-xl border-2 transition-all transform hover:scale-105 ${
                        settings.defaultStrokeWidth === width 
                          ? 'border-ios-blue bg-ios-blue/10 ring-2 ring-ios-blue/50 shadow-lg' 
                          : 'border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div 
                        className="bg-black dark:bg-white rounded-full"
                        style={{ height: `${width}px`, width: `${width * 2}px` }}
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>


        {/* Performance Settings */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-ios-blue/10 to-purple-500/10 blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">⚡</span>
              Performance
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-xl">
                <div>
                  <label className="text-sm font-semibold text-black dark:text-white">
                    Keep Screen Awake in Performance Mode
                  </label>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    Prevents screen from dimming while singing
                  </p>
                </div>
                <button
                  onClick={() => handleSettingChange('keepAwakeInPerformance', !settings.keepAwakeInPerformance)}
                  className={`w-14 h-8 rounded-full transition-all duration-300 relative ${
                    settings.keepAwakeInPerformance 
                      ? 'bg-ios-blue shadow-lg shadow-ios-blue/50' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 shadow-lg ${
                    settings.keepAwakeInPerformance ? 'translate-x-6' : 'translate-x-0'
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* About */}
        <div className="relative overflow-hidden rounded-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-gray-100/50 to-gray-200/50 dark:from-gray-800/50 dark:to-gray-700/50 blur-xl -z-10" />
          <div className="backdrop-blur-xl bg-white/80 dark:bg-gray-800/80 rounded-2xl p-8 border border-white/20 dark:border-gray-700/50 shadow-xl">
            <h3 className="text-2xl font-bold text-black dark:text-white mb-6 flex items-center gap-3">
              <span className="text-3xl">ℹ️</span>
              About
            </h3>
            
            <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
              <p className="font-semibold">Song Files v1.0.0</p>
              <p>Built with React, TypeScript, and Capacitor</p>
              <p>Offline-first PDF song management for singers</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
