import { Icon } from "@iconify/react";

export default function PasswordSection({
  isChangingPassword,
  passwordData,
  passwordErrors,
  showPassword,
  isSubmitting,
  onTogglePassword,
  onPasswordDataChange,
  onToggleChangePassword,
  onSavePassword
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-50 to-green-50/50 px-8 py-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
            <Icon icon="solar:lock-password-bold" className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">Security</h2>
            <p className="text-gray-600 text-sm">Manage your password and account security</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Icon icon="solar:lock-bold" className="w-5 h-5" />
            Change Password
          </h3>
          <button
            onClick={onToggleChangePassword}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
              isChangingPassword
                ? "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200"
                : "bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700 shadow-lg hover:shadow-xl"
            }`}
          >
            <Icon icon={isChangingPassword ? "solar:close-circle-bold" : "solar:lock-reset-bold"} className="w-4 h-4 mr-2" />
            {isChangingPassword ? "Cancel" : "Change Password"}
          </button>
        </div>

        {isChangingPassword && (
          <div className="space-y-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Icon icon="solar:lock-bold" className="w-4 h-4" />
                  Current Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.current ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => onPasswordDataChange({ ...passwordData, currentPassword: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.currentPassword ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => onTogglePassword("current")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon={showPassword.current ? "solar:eye-closed-bold" : "solar:eye-bold"} className="w-5 h-5" />
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
                    {passwordErrors.currentPassword}
                  </p>
                )}
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Icon icon="solar:lock-unlock-bold" className="w-4 h-4" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword.new ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => onPasswordDataChange({ ...passwordData, newPassword: e.target.value })}
                    className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                      passwordErrors.newPassword ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => onTogglePassword("new")}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    <Icon icon={showPassword.new ? "solar:eye-closed-bold" : "solar:eye-bold"} className="w-5 h-5" />
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-sm flex items-center gap-1">
                    <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
                    {passwordErrors.newPassword}
                  </p>
                )}
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Icon icon="solar:lock-check-bold" className="w-4 h-4" />
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={(e) => onPasswordDataChange({ ...passwordData, confirmPassword: e.target.value })}
                  className={`w-full px-4 py-3 pr-12 border rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 ${
                    passwordErrors.confirmPassword ? "border-red-300 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  placeholder="Confirm new password"
                />
                <button
                  type="button"
                  onClick={() => onTogglePassword("confirm")}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600"
                >
                  <Icon icon={showPassword.confirm ? "solar:eye-closed-bold" : "solar:eye-bold"} className="w-5 h-5" />
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-red-500 text-sm flex items-center gap-1">
                  <Icon icon="solar:info-circle-bold" className="w-4 h-4" />
                  {passwordErrors.confirmPassword}
                </p>
              )}
            </div>

            {/* Save Password Button */}
            <div className="pt-4">
              <button
                onClick={onSavePassword}
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 px-6 rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 font-semibold flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Icon icon="solar:loading-bold" className="w-5 h-5 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Icon icon="solar:lock-check-bold" className="w-5 h-5" />
                    Change Password
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 