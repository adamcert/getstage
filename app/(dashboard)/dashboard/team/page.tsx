"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  UserPlus,
  Mail,
  MoreVertical,
  Shield,
  Edit,
  Trash2,
  Search,
} from "lucide-react";

type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "admin" | "editor" | "viewer";
  avatar?: string;
  joinedAt: string;
};

const mockTeam: TeamMember[] = [
  {
    id: "1",
    name: "Jean Dupont",
    email: "jean@eventplatform.com",
    role: "owner",
    joinedAt: "Janvier 2024",
  },
  {
    id: "2",
    name: "Marie Martin",
    email: "marie@eventplatform.com",
    role: "admin",
    joinedAt: "Fevrier 2024",
  },
  {
    id: "3",
    name: "Pierre Bernard",
    email: "pierre@eventplatform.com",
    role: "editor",
    joinedAt: "Mars 2024",
  },
  {
    id: "4",
    name: "Sophie Leroy",
    email: "sophie@eventplatform.com",
    role: "viewer",
    joinedAt: "Avril 2024",
  },
];

const roleLabels: Record<TeamMember["role"], { label: string; color: string }> = {
  owner: { label: "Proprietaire", color: "bg-purple-100 text-purple-700" },
  admin: { label: "Admin", color: "bg-blue-100 text-blue-700" },
  editor: { label: "Editeur", color: "bg-green-100 text-green-700" },
  viewer: { label: "Lecteur", color: "bg-gray-100 text-gray-700" },
};

export default function TeamPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const filteredTeam = mockTeam.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Equipe</h1>
          <p className="mt-1 text-gray-500">
            Gerez les membres de votre equipe et leurs permissions.
          </p>
        </div>
        <Button leftIcon={<UserPlus className="w-5 h-5" />}>
          Inviter un membre
        </Button>
      </div>

      {/* Search */}
      <div className="w-full sm:w-72">
        <Input
          placeholder="Rechercher un membre..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          leftIcon={<Search className="w-5 h-5" />}
        />
      </div>

      {/* Team List */}
      <Card className="overflow-hidden">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Membre
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Role
                </th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Rejoint le
                </th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTeam.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <Avatar
                        fallback={member.name.charAt(0)}
                        size="md"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{member.name}</p>
                        <p className="text-sm text-gray-500">{member.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        roleLabels[member.role].color
                      }`}
                    >
                      <Shield className="w-3 h-3" />
                      {roleLabels[member.role].label}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{member.joinedAt}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      {member.role !== "owner" && (
                        <div className="relative">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2"
                            onClick={() =>
                              setActiveMenu(activeMenu === member.id ? null : member.id)
                            }
                          >
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                          {activeMenu === member.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={() => setActiveMenu(null)}
                              />
                              <div className="absolute right-0 z-50 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1">
                                <button
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Modifier le role
                                </button>
                                <button
                                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                  onClick={() => setActiveMenu(null)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Retirer
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile List */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredTeam.map((member) => (
            <div key={member.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Avatar fallback={member.name.charAt(0)} size="md" />
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.email}</p>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    roleLabels[member.role].color
                  }`}
                >
                  {roleLabels[member.role].label}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Pending Invitations */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900">
            Invitations en attente
          </h3>
        </div>
        <div className="text-center py-8 text-gray-500">
          <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>Aucune invitation en attente</p>
        </div>
      </Card>
    </div>
  );
}
