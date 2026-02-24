"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { useTranslation } from "@/hooks/use-translation";
import {
  User,
  Building2,
  CreditCard,
  Bell,
  Shield,
  Palette,
  Globe,
  Save,
  Upload,
} from "lucide-react";

const tabs = [
  { id: "profile", label: "Profil", icon: User },
  { id: "organization", label: "Organisation", icon: Building2 },
  { id: "billing", label: "Facturation", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Sécurité", icon: Shield },
];

export default function SettingsPage() {
  const { t: ts } = useTranslation("settings");
  const { t: tc } = useTranslation("common");
  const { t: td } = useTranslation("dashboard");
  const [activeTab, setActiveTab] = useState("profile");

  // Tabs with translations
  const localTabs = [
    { id: "profile", label: ts("profile"), icon: User },
    { id: "organization", label: ts("organization"), icon: Building2 },
    { id: "billing", label: ts("billing"), icon: CreditCard },
    { id: "notifications", label: ts("notifications"), icon: Bell },
    { id: "security", label: ts("security"), icon: Shield },
  ];
  const [formData, setFormData] = useState({
    fullName: "Jean Dupont",
    email: "jean@eventplatform.com",
    phone: "+33 6 12 34 56 78",
    bio: "Organisateur d'événements passionné",
    orgName: "Events Pro",
    orgWebsite: "https://eventspro.fr",
    orgAddress: "123 Avenue des Champs-Élysées, Paris",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{td("settings")}</h1>
        <p className="mt-1 text-gray-500">
          {ts("managePrefs")}
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {localTabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                      activeTab === tab.id
                        ? "bg-primary-50 text-primary-600"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        activeTab === tab.id ? "text-primary-500" : "text-gray-400"
                      }`}
                    />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>
        </div>

        {/* Content */}
        <div className="flex-1">
          {activeTab === "profile" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {ts("personalInfo")}
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <Avatar size="xl" fallback="JD" />
                <div>
                  <Button variant="outline" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                    {ts("changePhoto")}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    {ts("photoFormat")}
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label={ts("fullName")}
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                  <Input
                    label={ts("email")}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <Input
                  label={ts("phone")}
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {ts("bio")}
                  </label>
                  <textarea
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all duration-200 resize-none"
                    rows={4}
                    value={formData.bio}
                    onChange={(e) => handleChange("bio", e.target.value)}
                  />
                </div>
                <div className="flex justify-end">
                  <Button leftIcon={<Save className="w-4 h-4" />}>
                    {tc("save")}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "organization" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {ts("organization")}
              </h2>
              <div className="space-y-6">
                <Input
                  label={ts("orgName")}
                  value={formData.orgName}
                  onChange={(e) => handleChange("orgName", e.target.value)}
                  leftIcon={<Building2 className="w-5 h-5" />}
                />
                <Input
                  label={ts("website")}
                  value={formData.orgWebsite}
                  onChange={(e) => handleChange("orgWebsite", e.target.value)}
                  leftIcon={<Globe className="w-5 h-5" />}
                />
                <Input
                  label={ts("address")}
                  value={formData.orgAddress}
                  onChange={(e) => handleChange("orgAddress", e.target.value)}
                />
                <div className="flex justify-end">
                  <Button leftIcon={<Save className="w-4 h-4" />}>
                    {tc("save")}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {ts("billing")}
              </h2>
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">{ts("noPayment")}</p>
                <p className="text-sm mt-1 mb-6">
                  {ts("addPaymentDesc")}
                </p>
                <Button>{ts("addPayment")}</Button>
              </div>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {ts("notifPrefs")}
              </h2>
              <div className="space-y-6">
                {[
                  { id: "sales", label: ts("newSales"), description: ts("newSalesDesc") },
                  { id: "reviews", label: ts("customerReviews"), description: ts("customerReviewsDesc") },
                  { id: "marketing", label: ts("marketing"), description: ts("marketingDesc") },
                  { id: "security", label: ts("securityNotif"), description: ts("securityNotifDesc") },
                ].map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{item.label}</p>
                      <p className="text-sm text-gray-500">{item.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                    </label>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {activeTab === "security" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                {ts("security")}
              </h2>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{ts("password")}</p>
                      <p className="text-sm text-gray-500">
                        {ts("lastChanged")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {tc("edit")}
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        {ts("twoFactor")}
                      </p>
                      <p className="text-sm text-gray-500">
                        {ts("twoFactorDesc")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {tc("enable")}
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{ts("activeSessions")}</p>
                      <p className="text-sm text-gray-500">
                        {ts("manageDevices")}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      {tc("view")}
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
