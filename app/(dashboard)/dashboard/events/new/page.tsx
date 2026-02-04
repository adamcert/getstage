"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { EventCategory } from "@/types/database";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  MapPin,
  Euro,
  Image as ImageIcon,
  Plus,
  Trash2,
  Save,
  Send,
} from "lucide-react";

// Event categories
const categories: { value: EventCategory; label: string }[] = [
  { value: "concert", label: "Concert" },
  { value: "dj", label: "DJ / Soiree" },
  { value: "theatre", label: "Theatre" },
  { value: "comedy", label: "Comedie / Humour" },
  { value: "expo", label: "Exposition" },
  { value: "film", label: "Cinema" },
  { value: "party", label: "Fete" },
  { value: "festival", label: "Festival" },
  { value: "other", label: "Autre" },
];

// Mock venues for select
const mockVenues = [
  { id: "venue-1", name: "Le Rex Club" },
  { id: "venue-2", name: "L'Olympia" },
  { id: "venue-3", name: "Theatre Mogador" },
  { id: "venue-4", name: "Le Bataclan" },
  { id: "venue-5", name: "Concrete" },
  { id: "venue-6", name: "Zenith Paris" },
  { id: "venue-7", name: "Le Comedy Club" },
];

interface TicketTypeForm {
  id: string;
  name: string;
  price: string;
  quantity: string;
}

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<EventCategory>("concert");
  const [venueId, setVenueId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("");
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([
    { id: "1", name: "Standard", price: "", quantity: "" },
  ]);

  // Add ticket type
  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: Date.now().toString(),
        name: "",
        price: "",
        quantity: "",
      },
    ]);
  };

  // Remove ticket type
  const removeTicketType = (id: string) => {
    if (ticketTypes.length > 1) {
      setTicketTypes(ticketTypes.filter((t) => t.id !== id));
    }
  };

  // Update ticket type
  const updateTicketType = (id: string, field: keyof TicketTypeForm, value: string) => {
    setTicketTypes(
      ticketTypes.map((t) => (t.id === id ? { ...t, [field]: value } : t))
    );
  };

  // Handle form submission
  const handleSubmit = async (status: "draft" | "published") => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Creating event:", {
      title,
      description,
      category,
      venueId,
      startDate,
      startTime,
      endDate,
      endTime,
      coverImage,
      ticketTypes,
      status,
    });

    setIsSubmitting(false);
    router.push("/dashboard");
  };

  // Handle image upload (placeholder)
  const handleImageUpload = () => {
    // For now, just set a placeholder image
    setCoverImage("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="p-2">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Creer un evenement
          </h1>
          <p className="text-gray-500 mt-1">
            Remplissez les informations de votre evenement
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Informations generales
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Titre de l'evenement *"
              placeholder="Ex: Concert de Jazz au Sunset"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200 placeholder:text-gray-400 min-h-[120px] resize-y"
                placeholder="Decrivez votre evenement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Categorie *
              </label>
              <select
                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200"
                value={category}
                onChange={(e) => setCategory(e.target.value as EventCategory)}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Date and Time */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Date et heure
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date de debut *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                leftIcon={<CalendarDays className="w-5 h-5" />}
              />
              <Input
                label="Heure de debut *"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                leftIcon={<Clock className="w-5 h-5" />}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Date de fin"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                leftIcon={<CalendarDays className="w-5 h-5" />}
              />
              <Input
                label="Heure de fin"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                leftIcon={<Clock className="w-5 h-5" />}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Lieu</h2>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selectionner un lieu *
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all duration-200"
                  value={venueId}
                  onChange={(e) => setVenueId(e.target.value)}
                >
                  <option value="">Choisir un lieu...</option>
                  {mockVenues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cover Image */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Image de couverture
            </h2>
          </CardHeader>
          <CardContent>
            {coverImage ? (
              <div className="relative">
                <div
                  className="w-full h-48 rounded-xl bg-cover bg-center"
                  style={{ backgroundImage: `url(${coverImage})` }}
                />
                <button
                  onClick={() => setCoverImage(null)}
                  className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleImageUpload}
                className="w-full h-48 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-500 hover:text-primary-500 transition-colors"
              >
                <ImageIcon className="w-12 h-12 mb-2" />
                <span className="text-sm font-medium">
                  Cliquez pour ajouter une image
                </span>
                <span className="text-xs mt-1">
                  PNG, JPG jusqu'a 10MB
                </span>
              </button>
            )}
          </CardContent>
        </Card>

        {/* Ticket Types */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                Types de billets
              </h2>
              <Button
                variant="outline"
                size="sm"
                onClick={addTicketType}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Ajouter
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {ticketTypes.map((ticket, index) => (
              <div
                key={ticket.id}
                className="flex items-start gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    placeholder="Nom du billet"
                    value={ticket.name}
                    onChange={(e) =>
                      updateTicketType(ticket.id, "name", e.target.value)
                    }
                  />
                  <Input
                    placeholder="Prix"
                    type="number"
                    min="0"
                    step="0.01"
                    value={ticket.price}
                    onChange={(e) =>
                      updateTicketType(ticket.id, "price", e.target.value)
                    }
                    leftIcon={<Euro className="w-5 h-5" />}
                  />
                  <Input
                    placeholder="Quantite"
                    type="number"
                    min="1"
                    value={ticket.quantity}
                    onChange={(e) =>
                      updateTicketType(ticket.id, "quantity", e.target.value)
                    }
                  />
                </div>
                {ticketTypes.length > 1 && (
                  <button
                    onClick={() => removeTicketType(ticket.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors mt-1"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-8">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Annuler
            </Button>
          </Link>
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => handleSubmit("draft")}
            isLoading={isSubmitting}
            leftIcon={<Save className="w-5 h-5" />}
          >
            Enregistrer brouillon
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleSubmit("published")}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-5 h-5" />}
          >
            Publier
          </Button>
        </div>
      </div>
    </div>
  );
}
