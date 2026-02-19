"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { mockEvents } from "@/lib/data/mock-events";
import type { Event, EventCategory, EventStatus } from "@/types/database";
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
  Ticket,
  TrendingUp,
  Users,
  AlertTriangle,
  Eye,
} from "lucide-react";

// Event categories
const categories: { value: EventCategory; label: string }[] = [
  { value: "concert", label: "Concert" },
  { value: "dj", label: "DJ / Soirée" },
  { value: "theatre", label: "Théâtre" },
  { value: "comedy", label: "Comédie / Humour" },
  { value: "expo", label: "Exposition" },
  { value: "film", label: "Cinéma" },
  { value: "party", label: "Fête" },
  { value: "festival", label: "Festival" },
  { value: "other", label: "Autre" },
];

// Mock venues for select
const mockVenues = [
  { id: "venue-1", name: "Le Rex Club" },
  { id: "venue-2", name: "L'Olympia" },
  { id: "venue-3", name: "Théâtre Mogador" },
  { id: "venue-4", name: "Le Bataclan" },
  { id: "venue-5", name: "Concrete" },
  { id: "venue-6", name: "Zénith Paris" },
  { id: "venue-7", name: "Le Comedy Club" },
];

interface TicketTypeForm {
  id: string;
  name: string;
  price: string;
  quantity: string;
  sold: number;
}

// Helper to format date for input
function formatDateForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toISOString().split("T")[0];
}

// Helper to format time for input
function formatTimeForInput(dateString: string): string {
  const date = new Date(dateString);
  return date.toTimeString().slice(0, 5);
}

// Helper to get status badge
function getStatusBadge(status: EventStatus) {
  const statusConfig: Record<EventStatus, { label: string; variant: "default" | "new" | "hot" | "tonight" | "soldout" | "featured" }> = {
    draft: { label: "Brouillon", variant: "default" },
    preview: { label: "Aperçu", variant: "new" },
    published: { label: "Publié", variant: "hot" },
    cancelled: { label: "Annulé", variant: "soldout" },
    past: { label: "Terminé", variant: "default" },
  };
  return statusConfig[status] || statusConfig.draft;
}

export default function EditEventPage() {
  const router = useRouter();
  const params = useParams();
  const eventId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);

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
  const [ticketTypes, setTicketTypes] = useState<TicketTypeForm[]>([]);

  // Load event data
  useEffect(() => {
    const loadEvent = () => {
      const foundEvent = mockEvents.find((e) => e.id === eventId);
      if (foundEvent) {
        setEvent(foundEvent);
        setTitle(foundEvent.title);
        setDescription(foundEvent.description || "");
        setCategory(foundEvent.category);
        setVenueId(foundEvent.venue_id || "");
        setStartDate(formatDateForInput(foundEvent.start_date));
        setStartTime(formatTimeForInput(foundEvent.start_date));
        if (foundEvent.end_date) {
          setEndDate(formatDateForInput(foundEvent.end_date));
          setEndTime(formatTimeForInput(foundEvent.end_date));
        }
        setCoverImage(foundEvent.cover_image);
        if (foundEvent.ticket_types) {
          setTicketTypes(
            foundEvent.ticket_types.map((t) => ({
              id: t.id,
              name: t.name,
              price: t.price.toString(),
              quantity: t.quantity_total.toString(),
              sold: t.quantity_sold,
            }))
          );
        }
      }
      setIsLoading(false);
    };

    loadEvent();
  }, [eventId]);

  // Calculate stats
  const totalTickets = ticketTypes.reduce(
    (acc, t) => acc + parseInt(t.quantity || "0"),
    0
  );
  const totalSold = ticketTypes.reduce((acc, t) => acc + t.sold, 0);
  const totalRevenue = ticketTypes.reduce(
    (acc, t) => acc + t.sold * parseFloat(t.price || "0"),
    0
  );
  const salesProgress = totalTickets > 0 ? (totalSold / totalTickets) * 100 : 0;

  // Add ticket type
  const addTicketType = () => {
    setTicketTypes([
      ...ticketTypes,
      {
        id: Date.now().toString(),
        name: "",
        price: "",
        quantity: "",
        sold: 0,
      },
    ]);
  };

  // Remove ticket type
  const removeTicketType = (id: string) => {
    const ticket = ticketTypes.find((t) => t.id === id);
    if (ticket && ticket.sold > 0) {
      alert("Impossible de supprimer un type de billet avec des ventes.");
      return;
    }
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
  const handleSubmit = async (status: EventStatus) => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Updating event:", {
      id: eventId,
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

  // Handle delete
  const handleDelete = async () => {
    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    console.log("Deleting event:", eventId);

    setIsSubmitting(false);
    setShowDeleteModal(false);
    router.push("/dashboard");
  };

  // Handle image upload (placeholder)
  const handleImageUpload = () => {
    setCoverImage("https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800");
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-64 bg-gray-200 rounded" />
          <div className="h-48 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-6 text-center">
          <CalendarDays className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          <h2 className="text-lg font-medium text-gray-900">
            Événement non trouvé
          </h2>
          <p className="text-gray-500 mt-1 mb-6">
            Cet événement n'existe pas ou a été supprimé.
          </p>
          <Link href="/dashboard">
            <Button>Retour au dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  const statusBadge = getStatusBadge(event.status);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm" className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">
                Modifier l'événement
              </h1>
              <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
            </div>
            <p className="text-gray-500 mt-1">{title}</p>
          </div>
        </div>
        <Link href={`/event/${event.slug}`} target="_blank">
          <Button variant="outline" size="sm" leftIcon={<Eye className="w-4 h-4" />}>
            Voir
          </Button>
        </Link>
      </div>

      {/* Sales Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary-50">
              <Ticket className="w-5 h-5 text-primary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Tickets vendus</p>
              <p className="text-xl font-bold text-gray-900">
                {totalSold} / {totalTickets}
              </p>
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-500 rounded-full transition-all duration-300"
                style={{ width: `${salesProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-400 mt-1">
              {Math.round(salesProgress)}% des places vendues
            </p>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Revenus</p>
              <p className="text-xl font-bold text-gray-900">
                {totalRevenue.toLocaleString("fr-FR")} EUR
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-secondary-50">
              <Users className="w-5 h-5 text-secondary-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Participants</p>
              <p className="text-xl font-bold text-gray-900">{totalSold}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Form */}
      <div className="space-y-6">
        {/* Basic info */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Informations générales
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Titre de l'événement *"
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
                placeholder="Décrivez votre événement..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie *
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
                label="Date de début *"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                leftIcon={<CalendarDays className="w-5 h-5" />}
              />
              <Input
                label="Heure de début *"
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
                Sélectionner un lieu *
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
                  PNG, JPG jusqu'à 10MB
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
            {ticketTypes.map((ticket) => (
              <div
                key={ticket.id}
                className="p-4 bg-gray-50 rounded-xl space-y-3"
              >
                <div className="flex items-start gap-4">
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
                      placeholder="Quantité"
                      type="number"
                      min={ticket.sold}
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
                      disabled={ticket.sold > 0}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                {ticket.sold > 0 && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Ticket className="w-4 h-4" />
                    <span>{ticket.sold} billets vendus</span>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-red-200">
          <CardHeader>
            <h2 className="text-lg font-semibold text-red-600">Zone de danger</h2>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  Supprimer cet événement
                </p>
                <p className="text-sm text-gray-500">
                  Cette action est irréversible. Toutes les données seront perdues.
                </p>
              </div>
              <Button
                variant="danger"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                leftIcon={<Trash2 className="w-4 h-4" />}
              >
                Supprimer
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pb-8">
          <Link href="/dashboard" className="w-full sm:w-auto">
            <Button variant="ghost" className="w-full sm:w-auto">
              Annuler
            </Button>
          </Link>
          {event.status === "draft" && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => handleSubmit("draft")}
              isLoading={isSubmitting}
              leftIcon={<Save className="w-5 h-5" />}
            >
              Enregistrer brouillon
            </Button>
          )}
          <Button
            className="w-full sm:w-auto"
            onClick={() => handleSubmit(event.status === "draft" ? "published" : event.status)}
            isLoading={isSubmitting}
            leftIcon={event.status === "draft" ? <Send className="w-5 h-5" /> : <Save className="w-5 h-5" />}
          >
            {event.status === "draft" ? "Publier" : "Sauvegarder"}
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowDeleteModal(false)}
          />
          <div className="relative z-50 bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Supprimer l'événement
                </h3>
                <p className="text-sm text-gray-500">
                  Cette action est irréversible
                </p>
              </div>
            </div>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer "{title}" ? Toutes les données
              associées (billets, commandes, etc.) seront perdues.
            </p>
            <div className="flex items-center justify-end gap-3">
              <Button
                variant="ghost"
                onClick={() => setShowDeleteModal(false)}
                disabled={isSubmitting}
              >
                Annuler
              </Button>
              <Button
                variant="danger"
                onClick={handleDelete}
                isLoading={isSubmitting}
              >
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
