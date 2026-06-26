import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ShieldCheck, Trash2, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/lib/auth'
import { setup2FA, disable2FA, deleteAccount } from '@/lib/api'

export default function Settings() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [qr, setQr] = useState<string | null>(null)
  const [secret, setSecret] = useState('')
  const [twoFAEnabled, setTwoFAEnabled] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSetup2FA() {
    const data = await setup2FA()
    setQr(data.qr_code)
    setSecret(data.secret)
    setTwoFAEnabled(true)
  }

  async function handleDisable2FA() {
    await disable2FA()
    setQr(null)
    setSecret('')
    setTwoFAEnabled(false)
  }

  async function handleDeleteAccount() {
    await deleteAccount()
    logout()
    navigate('/')
  }

  return (
    <div className="p-8 max-w-2xl mx-auto animate-fade-in space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground text-sm mt-0.5">Manage your account and security</p>
      </div>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck size={18} className="text-primary" /> Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!twoFAEnabled ? (
            <>
              <p className="text-sm text-muted-foreground mb-4">
                Add an extra layer of security. You'll need an authenticator app like Google Authenticator or Authy.
              </p>
              <Button onClick={handleSetup2FA} className="gradient-bg border-0 text-white">
                <Smartphone size={15} className="mr-1.5" /> Enable 2FA
              </Button>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-start gap-2 text-sm text-green-700 bg-green-50 rounded-lg p-3">
                <ShieldCheck size={16} className="mt-0.5" /> 2FA is now enabled. Scan the QR code below.
              </div>
              {qr && (
                <div className="flex flex-col items-center gap-3 py-4">
                  <img src={qr} alt="2FA QR Code" className="w-44 h-44 rounded-lg border" />
                  <p className="text-xs text-muted-foreground">Scan with your authenticator app</p>
                  <code className="text-xs bg-muted px-3 py-1.5 rounded-md select-all">{secret}</code>
                </div>
              )}
              <Button variant="outline" onClick={handleDisable2FA}>Disable 2FA</Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Danger zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base text-destructive">
            <Trash2 size={18} /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Permanently delete your account and all documents. This cannot be undone.
          </p>
          {!confirmDelete ? (
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/5" onClick={() => setConfirmDelete(true)}>
              Delete account
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <Button variant="destructive" onClick={handleDeleteAccount}>Yes, delete everything</Button>
              <Button variant="ghost" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
