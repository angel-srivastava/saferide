import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useInternetIdentity } from "@caffeineai/core-infrastructure";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createRoute } from "@tanstack/react-router";
import {
  LogOut,
  Moon,
  Phone,
  Plus,
  Shield,
  Star,
  Trash2,
  Users,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useState } from "react";
import { toast } from "sonner";
import { MobileLayout } from "../../components/layout/MobileLayout";
import { TopBar } from "../../components/layout/TopBar";
import { RatingStars } from "../../components/shared/RatingStars";
import { UserAvatar } from "../../components/shared/UserAvatar";
import { useBackend } from "../../hooks/useBackend";
import { useAuthStore } from "../../store/authStore";
import { Route as rootRoute } from "../__root";

const EC_KEY = "saferide_emergency_contacts";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
}

function loadContacts(): EmergencyContact[] {
  try {
    return JSON.parse(
      localStorage.getItem(EC_KEY) ?? "[]",
    ) as EmergencyContact[];
  } catch {
    return [];
  }
}

function saveContacts(contacts: EmergencyContact[]) {
  localStorage.setItem(EC_KEY, JSON.stringify(contacts));
}

function PassengerProfilePage() {
  const { clear } = useInternetIdentity();
  const { user, logout } = useAuthStore();
  const { actor } = useBackend();
  const qc = useQueryClient();
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  const [contacts, setContacts] = useState<EmergencyContact[]>(loadContacts);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newPhone, setNewPhone] = useState("");

  // Fetch passenger profile stats
  const { data: passengerProfile } = useQuery({
    queryKey: ["passengerProfile", user?.id?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getPassengerProfile(user.id);
    },
    enabled: !!actor && !!user,
  });

  const { data: ratingSummary } = useQuery({
    queryKey: ["myRatings", user?.id?.toString()],
    queryFn: async () => {
      if (!actor || !user) return null;
      return actor.getRatingsForUser(user.id);
    },
    enabled: !!actor && !!user,
  });

  const handleLogout = () => {
    clear();
    logout();
    qc.clear();
    toast.info("Signed out successfully");
  };

  const handleAddContact = () => {
    if (!newName.trim() || !newPhone.trim()) {
      toast.error("Please enter both name and phone number");
      return;
    }
    if (contacts.length >= 3) {
      toast.error("Maximum 3 emergency contacts allowed");
      return;
    }
    const updated = [
      ...contacts,
      {
        id: Date.now().toString(),
        name: newName.trim(),
        phone: newPhone.trim(),
      },
    ];
    setContacts(updated);
    saveContacts(updated);
    setNewName("");
    setNewPhone("");
    setShowAddForm(false);
    toast.success("Emergency contact added");
  };

  const handleRemoveContact = (id: string) => {
    const updated = contacts.filter((c) => c.id !== id);
    setContacts(updated);
    saveContacts(updated);
    toast.success("Contact removed");
  };

  if (!user) {
    return (
      <MobileLayout userRole="passenger">
        <TopBar title="Profile" />
        <div className="flex items-center justify-center min-h-[50vh]">
          <p className="text-muted-foreground text-sm">Please sign in</p>
        </div>
      </MobileLayout>
    );
  }

  const avgRating = ratingSummary?.avgScore ?? passengerProfile?.avgRating ?? 0;
  const totalRides = passengerProfile?.totalRides ?? BigInt(0);

  return (
    <MobileLayout userRole="passenger">
      <TopBar title="Profile" />
      <div className="px-5 py-6 space-y-5 pb-8">
        {/* Avatar + Name */}
        <div className="flex flex-col items-center gap-3">
          <UserAvatar name={user.name} photoUrl={user.photoUrl} size="xl" />
          <div className="text-center">
            <h2 className="font-display text-xl font-semibold text-foreground">
              {user.name}
            </h2>
            <p className="text-sm text-muted-foreground mt-0.5">{user.phone}</p>
          </div>
          <Badge
            variant="secondary"
            className="flex items-center gap-1.5 px-3 py-1"
          >
            <Shield size={12} className="text-primary" />
            <span className="text-xs font-medium">Passenger</span>
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl p-4 flex flex-col items-center gap-1.5 shadow-card border border-border/40">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users size={14} />
              <span className="text-xs font-medium">Total Rides</span>
            </div>
            <p className="text-2xl font-bold text-foreground font-display">
              {totalRides.toString()}
            </p>
          </div>
          <div className="bg-card rounded-2xl p-4 flex flex-col items-center gap-1.5 shadow-card border border-border/40">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Star size={14} />
              <span className="text-xs font-medium">Avg Rating</span>
            </div>
            <p className="text-2xl font-bold text-foreground font-display">
              {avgRating > 0 ? avgRating.toFixed(1) : "—"}
            </p>
            {avgRating > 0 && <RatingStars rating={avgRating} size="sm" />}
          </div>
        </div>

        {/* Account Details */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/40 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">
            Account Details
          </h3>
          <Separator />
          <div className="space-y-3 text-sm">
            {[
              { label: "Name", value: user.name },
              { label: "Phone", value: user.phone },
              { label: "Gender", value: user.gender as string },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-muted-foreground">{label}</span>
                <span className="font-medium text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Emergency Contacts */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/40 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
              <Phone size={14} className="text-primary" />
              Emergency Contacts
            </h3>
            {contacts.length < 3 && (
              <button
                type="button"
                onClick={() => setShowAddForm((v) => !v)}
                className="flex items-center gap-1 text-xs text-primary font-medium hover:text-primary/80 transition-colors min-h-[44px] min-w-[44px] justify-end"
                data-ocid="add-contact-btn"
              >
                <Plus size={14} />
                Add
              </button>
            )}
          </div>

          {contacts.length === 0 && !showAddForm && (
            <p className="text-xs text-muted-foreground py-1">
              No emergency contacts added. Add up to 3 contacts who'll be
              notified during SOS.
            </p>
          )}

          <div className="space-y-2">
            {contacts.map((contact) => (
              <div
                key={contact.id}
                className="flex items-center gap-3 bg-muted/30 rounded-xl px-3 py-2.5"
                data-ocid={`contact-row-${contact.id}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {contact.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {contact.phone}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveContact(contact.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors min-h-[44px] min-w-[44px] flex items-center justify-end"
                  aria-label="Remove contact"
                  data-ocid={`remove-contact-${contact.id}`}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>

          {showAddForm && (
            <div className="space-y-3 pt-1 border-t border-border/40">
              <div>
                <Label htmlFor="ec-name" className="text-xs font-medium">
                  Contact Name
                </Label>
                <Input
                  id="ec-name"
                  placeholder="Rahul Kumar"
                  className="mt-1 h-10 rounded-xl text-sm"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  data-ocid="ec-name-input"
                />
              </div>
              <div>
                <Label htmlFor="ec-phone" className="text-xs font-medium">
                  Phone Number
                </Label>
                <Input
                  id="ec-phone"
                  placeholder="+91 98765 43210"
                  className="mt-1 h-10 rounded-xl text-sm"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  data-ocid="ec-phone-input"
                />
              </div>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  className="flex-1 rounded-xl"
                  onClick={handleAddContact}
                  data-ocid="save-contact-btn"
                >
                  Save Contact
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewName("");
                    setNewPhone("");
                  }}
                  data-ocid="cancel-contact-btn"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <div className="bg-card rounded-2xl p-4 shadow-card border border-border/40 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Settings</h3>
          <Separator />

          <div className="flex items-center justify-between py-0.5">
            <div className="flex items-center gap-2.5">
              <Moon size={16} className="text-muted-foreground" />
              <span className="text-sm text-foreground">Dark Mode</span>
            </div>
            <Switch
              checked={isDark}
              onCheckedChange={(checked) =>
                setTheme(checked ? "dark" : "light")
              }
              data-ocid="dark-mode-toggle"
              aria-label="Toggle dark mode"
            />
          </div>
        </div>

        {/* Logout */}
        <Button
          variant="destructive"
          className="w-full h-12 rounded-2xl"
          onClick={handleLogout}
          data-ocid="logout-btn"
        >
          <LogOut size={16} className="mr-2" />
          Sign Out
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary"
            target="_blank"
            rel="noreferrer"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </MobileLayout>
  );
}

export const Route = createRoute({
  getParentRoute: () => rootRoute,
  path: "/passenger/profile",
  component: PassengerProfilePage,
});
