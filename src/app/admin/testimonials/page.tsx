"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import Link from "next/link";

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  company: string | null;
  content: string;
  rating: number;
  featured: boolean;
  published: boolean;
}

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  useEffect(() => {
    fetch("/api/admin/testimonials")
      .then((r) => r.json())
      .then(setTestimonials);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await fetch(`/api/admin/testimonials/${id}`, { method: "DELETE" });
    setTestimonials(testimonials.filter((t) => t.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Testimonials</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage client testimonials</p>
        </div>
        <Link href="/admin/testimonials/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Testimonial</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {testimonials.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-bold text-xs">
                      {t.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">{t.name}</h3>
                      <p className="text-xs text-muted-foreground">{t.role}{t.company && `, ${t.company}`}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">&ldquo;{t.content}&rdquo;</p>
                  <div className="flex items-center gap-1 mt-2">
                    {Array.from({ length: t.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {t.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                  <Badge variant={t.published ? "default" : "outline"} className="text-xs">
                    {t.published ? "Published" : "Draft"}
                  </Badge>
                  <Link href={`/admin/testimonials/${t.id}?edit=${t.id}`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleDelete(t.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {testimonials.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">No testimonials yet. Add your first one!</div>
        )}
      </div>
    </div>
  );
}
