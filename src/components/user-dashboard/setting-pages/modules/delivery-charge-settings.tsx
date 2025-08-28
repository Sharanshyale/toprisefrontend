"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Edit, Mail, Phone, Globe, MapPin, FileText, Settings } from "lucide-react"
import { getAppSettings } from "@/service/deliverychargeServices"
import { DeliveryChargeEditModal } from "@/components/user-dashboard/setting-pages/modules/popups/delivery-charge-edit-modal"
import type { AppSettings } from "@/types/deliverycharge-Types"
import { useToast } from "@/components/ui/toast"

export function DeliveryChargeSettings() {
  const { showToast } = useToast()
  const [settings, setSettings] = useState<AppSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchSettings = async () => {
    setLoading(true)
    try {
      const response = await getAppSettings()
      setSettings(response.data)
    } catch (error) {
      console.error("Error fetching settings:", error)
      showToast("Failed to load settings. Please refresh the page.", "error")
    } finally {
      setLoading(false)
    }
  }

  const handleSettingsUpdate = (updatedSettings: AppSettings) => {
    setSettings(updatedSettings)
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-[#c72920]" />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Delivery Settings Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Delivery Settings
          </CardTitle>
          <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Edit
          </Button>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Delivery Charge</div>
            <div className="font-medium text-lg">₹{settings?.deliveryCharge || 0}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Minimum Order Value</div>
            <div className="font-medium text-lg">₹{settings?.minimumOrderValue || 0}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Status</div>
            <div className="font-medium text-green-600">Active</div>
          </div>
        </CardContent>
      </Card>

      {/* SMTP Settings Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            SMTP Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">SMTP Host</div>
            <div className="font-medium">{settings?.smtp?.host || "Not configured"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">SMTP Port</div>
            <div className="font-medium">{settings?.smtp?.port || "Not set"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">From Name</div>
            <div className="font-medium">{settings?.smtp?.fromName || "Not set"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">From Email</div>
            <div className="font-medium">{settings?.smtp?.fromEmail || "Not set"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Secure Connection</div>
            <div className="font-medium">{settings?.smtp?.secure ? "Yes" : "No"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Auth User</div>
            <div className="font-medium">{settings?.smtp?.auth?.user || "Not set"}</div>
          </div>
        </CardContent>
      </Card>

      {/* Versioning Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            App Versioning
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Web Version</div>
            <div className="font-medium">{settings?.versioning?.web || "Not set"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Android Version</div>
            <div className="font-medium">{settings?.versioning?.android || "Not set"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">iOS Version</div>
            <div className="font-medium">{settings?.versioning?.ios || "Not set"}</div>
          </div>
        </CardContent>
      </Card>

      {/* Support Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Support Information
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Support Email</div>
            <div className="font-medium">{settings?.supportEmail || "Not set"}</div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Support Phone</div>
            <div className="font-medium">{settings?.supportPhone || "Not set"}</div>
          </div>
        </CardContent>
      </Card>

      {/* Legal Links Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Legal Links
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Terms & Conditions</div>
            <div className="font-medium text-blue-600 hover:underline">
              <a href={settings?.tnc} target="_blank" rel="noopener noreferrer">
                {settings?.tnc || "Not set"}
              </a>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-sm text-gray-600">Privacy Policy</div>
            <div className="font-medium text-blue-600 hover:underline">
              <a href={settings?.privacyPolicy} target="_blank" rel="noopener noreferrer">
                {settings?.privacyPolicy || "Not set"}
              </a>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Serviceable Areas Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Serviceable Areas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {settings?.servicableAreas?.map((area, index) => (
              <div key={area._id || index} className="p-3 border rounded-lg">
                <div className="text-sm text-gray-600">Area {index + 1}</div>
                <div className="font-medium">
                  Lat: {area.lat}, Long: {area.long}
                </div>
              </div>
            ))}
            {(!settings?.servicableAreas || settings.servicableAreas.length === 0) && (
              <div className="text-gray-500">No serviceable areas configured</div>
            )}
          </div>
        </CardContent>
      </Card>

      <DeliveryChargeEditModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
        onUpdate={handleSettingsUpdate}
      />
    </div>
  )
}
