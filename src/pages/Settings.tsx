import { useSession, signOut } from '../lib/auth'
import { useAppProfile } from '../lib/useAppProfile'

const APP_VERSION = '1.0.0'

export default function Settings() {
  const { session } = useSession()
  const profile = useAppProfile()

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-emerald-deep">Settings</h2>

      <section className="rounded-xl bg-white p-4 shadow">
        <h3 className="font-semibold text-emerald-deep">Notifications</h3>
        <label className="mt-2 flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={profile.notificationsEnabled}
            onChange={async (e) => {
              const enabled = e.target.checked
              if (enabled && 'Notification' in window) {
                await Notification.requestPermission()
              }
              profile.updateProfile({ notificationsEnabled: enabled })
            }}
          />
          Prayer time & activity reminders
        </label>
      </section>

      <section className="rounded-xl bg-white p-4 shadow text-sm text-gray-500">
        <p>Halo v{APP_VERSION}</p>
        <p className="mt-1 text-xs">
          Prayer times: AlAdhan API · Halal certification: AFIC, ICCA, Halal Australia · Product data: Open Food
          Facts · Grocery prices: Woolworths
        </p>
      </section>

      {session?.user && (
        <button onClick={signOut} className="w-full rounded-xl border border-red-200 py-2 text-sm font-medium text-red-600">
          Sign out
        </button>
      )}
    </div>
  )
}
