"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
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
  const [activeTab, setActiveTab] = useState("profile");
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
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="mt-1 text-gray-500">
          Gérez votre compte et vos préférences.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <div className="lg:w-64 flex-shrink-0">
          <Card className="p-2">
            <nav className="space-y-1">
              {tabs.map((tab) => {
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
                Informations personnelles
              </h2>

              {/* Avatar */}
              <div className="flex items-center gap-6 mb-8">
                <Avatar size="xl" fallback="JD" />
                <div>
                  <Button variant="outline" size="sm" leftIcon={<Upload className="w-4 h-4" />}>
                    Changer la photo
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    JPG, PNG ou GIF. Max 2MB.
                  </p>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Nom complet"
                    value={formData.fullName}
                    onChange={(e) => handleChange("fullName", e.target.value)}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                <Input
                  label="Téléphone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bio
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
                    Enregistrer
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "organization" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Organisation
              </h2>
              <div className="space-y-6">
                <Input
                  label="Nom de l'organisation"
                  value={formData.orgName}
                  onChange={(e) => handleChange("orgName", e.target.value)}
                  leftIcon={<Building2 className="w-5 h-5" />}
                />
                <Input
                  label="Site web"
                  value={formData.orgWebsite}
                  onChange={(e) => handleChange("orgWebsite", e.target.value)}
                  leftIcon={<Globe className="w-5 h-5" />}
                />
                <Input
                  label="Adresse"
                  value={formData.orgAddress}
                  onChange={(e) => handleChange("orgAddress", e.target.value)}
                />
                <div className="flex justify-end">
                  <Button leftIcon={<Save className="w-4 h-4" />}>
                    Enregistrer
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === "billing" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Facturation
              </h2>
              <div className="text-center py-12 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium">Aucun moyen de paiement</p>
                <p className="text-sm mt-1 mb-6">
                  Ajoutez un moyen de paiement pour recevoir vos revenus.
                </p>
                <Button>Ajouter un moyen de paiement</Button>
              </div>
            </Card>
          )}

          {activeTab === "notifications" && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">
                Préférences de notifications
              </h2>
              <div className="space-y-6">
                {[
                  { id: "sales", label: "Nouvelles ventes", description: "Recevoir un email pour chaque vente" },
                  { id: "reviews", label: "Avis clients", description: "Être notifié des nouveaux avis" },
                  { id: "marketing", label: "Marketing", description: "Conseils et actualités Events" },
                  { id: "security", label: "Sécurité", description: "Alertes de connexion et sécurité" },
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
                Sécurité
              </h2>
              <div className="space-y-6">
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Mot de passe</p>
                      <p className="text-sm text-gray-500">
                        Dernière modification il y a 3 mois
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Modifier
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">
                        Authentification à deux facteurs
                      </p>
                      <p className="text-sm text-gray-500">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Activer
                    </Button>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">Sessions actives</p>
                      <p className="text-sm text-gray-500">
                        Gérez vos appareils connectés
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Voir
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
