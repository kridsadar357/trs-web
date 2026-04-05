"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Mail, Clock, Eye, EyeOff, Trash2 } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  subject: string | null;
  message: string;
  status: string;
  read: boolean;
  createdAt: string;
}

export default function AdminContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    fetch("/api/contact")
      .then((r) => r.json())
      .then(setContacts);
  }, []);

  const toggleRead = async (id: string, currentRead: boolean) => {
    await fetch(`/api/admin/contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ read: !currentRead }),
    });
    setContacts(contacts.map((c) => (c.id === id ? { ...c, read: !currentRead } : c)));
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this submission?")) return;
    await fetch(`/api/admin/contacts/${id}`, { method: "DELETE" });
    setContacts(contacts.filter((c) => c.id !== id));
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-heading text-2xl font-bold">Contact Submissions</h1>
        <p className="text-muted-foreground text-sm mt-1">View and manage contact form submissions</p>
      </div>

      <div className="grid gap-4">
        {contacts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-muted-foreground">
              <Mail className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No submissions yet</p>
            </CardContent>
          </Card>
        ) : (
          contacts.map((contact) => (
            <Card key={contact.id} className={!contact.read ? "border-primary/30" : ""}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-sm">{contact.name}</h3>
                      {!contact.read && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>{contact.email}</span>
                      {contact.phone && <span>{contact.phone}</span>}
                      {contact.company && <span>{contact.company}</span>}
                    </div>
                    {contact.subject && (
                      <p className="text-sm font-medium mt-2">{contact.subject}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{contact.message}</p>
                    <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(contact.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <Badge
                      variant={contact.status === "new" ? "default" : contact.status === "replied" ? "secondary" : "outline"}
                      className="text-xs"
                    >
                      {contact.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => toggleRead(contact.id, contact.read)}
                      title={contact.read ? "Mark unread" : "Mark read"}
                    >
                      {contact.read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
