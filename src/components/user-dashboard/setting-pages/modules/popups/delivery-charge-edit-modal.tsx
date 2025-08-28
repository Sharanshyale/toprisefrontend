"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { updateAppSettings } from "@/service/deliverychargeServices"
import type { AppSettings, ServiceableArea } from "@/types/deliverycharge-Types"
import { Plus, Trash2, Settings, Mail, Phone, MapPin, FileText } from "lucide-react"
import { useToast } from "@/components/ui/toast"

interface DeliveryChargeEditModalProps {
  isOpen: boolean
  onClose: () => void
  settings: AppSettings | null
  onUpdate: (settings: AppSettings) => void
}

export function DeliveryChargeEditModal({ isOpen, onClose, settings, onUpdate }: DeliveryChargeEditModalProps) {
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    deliveryCharge: "",
    minimumOrderValue: "",
    smtp: {
      fromName: "",
      fromEmail: "",
      host: "",
      port: "",
      secure: false,
      auth: {
        user: "",
        pass: ""
      }
    },
    versioning: {
      web: "",
      android: "",
      ios: ""
    },
    servicableAreas: [] as ServiceableArea[],
    supportEmail: "",
    supportPhone: "",
    tnc: "",
    privacyPolicy: ""
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (settings) {
      setFormData({
        deliveryCharge: settings.deliveryCharge?.toString() || "",
        minimumOrderValue: settings.minimumOrderValue?.toString() || "",
        smtp: {
          fromName: settings.smtp?.fromName || "",
          fromEmail: settings.smtp?.fromEmail || "",
          host: settings.smtp?.host || "",
          port: settings.smtp?.port?.toString() || "",
          secure: settings.smtp?.secure || false,
          auth: {
            user: settings.smtp?.auth?.user || "",
            pass: settings.smtp?.auth?.pass || ""
          }
        },
        versioning: {
          web: settings.versioning?.web || "",
          android: settings.versioning?.android || "",
          ios: settings.versioning?.ios || ""
        },
        servicableAreas: settings.servicableAreas || [],
        supportEmail: settings.supportEmail || "",
        supportPhone: settings.supportPhone || "",
        tnc: settings.tnc || "",
        privacyPolicy: settings.privacyPolicy || ""
      })
    }
  }, [settings])

  const handleSave = async () => {
    if (!settings) return

    setIsLoading(true)
    try {
      const updatedSettings = {
        ...settings,
        deliveryCharge: Number.parseFloat(formData.deliveryCharge) || 0,
        minimumOrderValue: Number.parseFloat(formData.minimumOrderValue) || 0,
        smtp: {
          ...settings.smtp,
          fromName: formData.smtp.fromName,
          fromEmail: formData.smtp.fromEmail,
          host: formData.smtp.host,
          port: Number.parseInt(formData.smtp.port) || 587,
          secure: formData.smtp.secure,
          auth: {
            user: formData.smtp.auth.user,
            pass: formData.smtp.auth.pass
          }
        },
        versioning: {
          ...settings.versioning,
          web: formData.versioning.web,
          android: formData.versioning.android,
          ios: formData.versioning.ios
        },
        servicableAreas: formData.servicableAreas,
        supportEmail: formData.supportEmail,
        supportPhone: formData.supportPhone,
        tnc: formData.tnc,
        privacyPolicy: formData.privacyPolicy
      }

      const response = await updateAppSettings(updatedSettings)
      if (response?.data) {
        onUpdate(response.data)
        showToast("Settings updated successfully!", "success")
        onClose()
      } else {
        showToast("Failed to update settings. Please try again.", "error")
      }
    } catch (error) {
      console.error("Error updating settings:", error)
      showToast("An error occurred while updating settings. Please try again.", "error")
    } finally {
      setIsLoading(false)
    }
  }

  const addServiceableArea = () => {
    setFormData(prev => ({
      ...prev,
      servicableAreas: [...prev.servicableAreas, { lat: 0, long: 0 }]
    }))
  }

  const removeServiceableArea = (index: number) => {
    setFormData(prev => ({
      ...prev,
      servicableAreas: prev.servicableAreas.filter((_, i) => i !== index)
    }))
  }

  const updateServiceableArea = (index: number, field: 'lat' | 'long', value: string) => {
    setFormData(prev => ({
      ...prev,
      servicableAreas: prev.servicableAreas.map((area, i) => 
        i === index ? { ...area, [field]: Number.parseFloat(value) || 0 } : area
      )
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-6 rounded-lg shadow-lg">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-3 md:pb-4">
          <DialogTitle className="text-xl md:text-2xl font-bold">Edit Application Settings</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Delivery Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Settings className="h-5 w-5" />
              Delivery Settings
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="delivery-charge">Delivery Charge</Label>
                <Input
                  id="delivery-charge"
                  type="number"
                  placeholder="Enter delivery charge"
                  value={formData.deliveryCharge}
                  onChange={(e) => setFormData((prev) => ({ ...prev, deliveryCharge: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="minimum-order">Minimum Order Value</Label>
                <Input
                  id="minimum-order"
                  type="number"
                  placeholder="Enter minimum order value"
                  value={formData.minimumOrderValue}
                  onChange={(e) => setFormData((prev) => ({ ...prev, minimumOrderValue: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* SMTP Settings Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Mail className="h-5 w-5" />
              SMTP Configuration
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.gmail.com"
                  value={formData.smtp.host}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, host: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  type="number"
                  placeholder="587"
                  value={formData.smtp.port}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, port: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-from-name">From Name</Label>
                <Input
                  id="smtp-from-name"
                  placeholder="Your Company Name"
                  value={formData.smtp.fromName}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, fromName: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-from-email">From Email</Label>
                <Input
                  id="smtp-from-email"
                  type="email"
                  placeholder="noreply@yourdomain.com"
                  value={formData.smtp.fromEmail}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { ...prev.smtp, fromEmail: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-auth-user">Auth User</Label>
                <Input
                  id="smtp-auth-user"
                  placeholder="your-email@gmail.com"
                  value={formData.smtp.auth.user}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { 
                      ...prev.smtp, 
                      auth: { ...prev.smtp.auth, user: e.target.value } 
                    } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="smtp-auth-pass">Auth Password</Label>
                <Input
                  id="smtp-auth-pass"
                  type="password"
                  placeholder="App password"
                  value={formData.smtp.auth.pass}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    smtp: { 
                      ...prev.smtp, 
                      auth: { ...prev.smtp.auth, pass: e.target.value } 
                    } 
                  }))}
                />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="smtp-secure"
                checked={formData.smtp.secure}
                onCheckedChange={(checked) => setFormData((prev) => ({ 
                  ...prev, 
                  smtp: { ...prev.smtp, secure: checked } 
                }))}
              />
              <Label htmlFor="smtp-secure">Secure Connection</Label>
            </div>
          </div>

          {/* Versioning Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Settings className="h-5 w-5" />
              App Versioning
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="web-version">Web Version</Label>
                <Input
                  id="web-version"
                  placeholder="1.0.0"
                  value={formData.versioning.web}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    versioning: { ...prev.versioning, web: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="android-version">Android Version</Label>
                <Input
                  id="android-version"
                  placeholder="1.1.0"
                  value={formData.versioning.android}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    versioning: { ...prev.versioning, android: e.target.value } 
                  }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="ios-version">iOS Version</Label>
                <Input
                  id="ios-version"
                  placeholder="1.0.1"
                  value={formData.versioning.ios}
                  onChange={(e) => setFormData((prev) => ({ 
                    ...prev, 
                    versioning: { ...prev.versioning, ios: e.target.value } 
                  }))}
                />
              </div>
            </div>
          </div>

          {/* Support Information Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <Phone className="h-5 w-5" />
              Support Information
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="support-email">Support Email</Label>
                <Input
                  id="support-email"
                  type="email"
                  placeholder="support@yourdomain.com"
                  value={formData.supportEmail}
                  onChange={(e) => setFormData((prev) => ({ ...prev, supportEmail: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="support-phone">Support Phone</Label>
                <Input
                  id="support-phone"
                  placeholder="+919876543210"
                  value={formData.supportPhone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, supportPhone: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Legal Links Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-lg font-semibold">
              <FileText className="h-5 w-5" />
              Legal Links
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tnc">Terms & Conditions URL</Label>
                <Input
                  id="tnc"
                  type="url"
                  placeholder="https://yourdomain.com/terms"
                  value={formData.tnc}
                  onChange={(e) => setFormData((prev) => ({ ...prev, tnc: e.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="privacy-policy">Privacy Policy URL</Label>
                <Input
                  id="privacy-policy"
                  type="url"
                  placeholder="https://yourdomain.com/privacy"
                  value={formData.privacyPolicy}
                  onChange={(e) => setFormData((prev) => ({ ...prev, privacyPolicy: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Serviceable Areas Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-lg font-semibold">
                <MapPin className="h-5 w-5" />
                Serviceable Areas
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addServiceableArea}>
                <Plus className="h-4 w-4 mr-2" />
                Add Area
              </Button>
            </div>
            <div className="space-y-3">
              {formData.servicableAreas.map((area, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border rounded-lg">
                  <div className="grid grid-cols-2 gap-3 flex-1">
                    <div className="grid gap-1">
                      <Label htmlFor={`lat-${index}`}>Latitude</Label>
                      <Input
                        id={`lat-${index}`}
                        type="number"
                        step="any"
                        placeholder="28.6139"
                        value={area.lat}
                        onChange={(e) => updateServiceableArea(index, 'lat', e.target.value)}
                      />
                    </div>
                    <div className="grid gap-1">
                      <Label htmlFor={`long-${index}`}>Longitude</Label>
                      <Input
                        id={`long-${index}`}
                        type="number"
                        step="any"
                        placeholder="77.209"
                        value={area.long}
                        onChange={(e) => updateServiceableArea(index, 'long', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeServiceableArea(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.servicableAreas.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No serviceable areas configured
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-[var(--new-300)] hover:bg-[var(--new-400)] text-white"
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
