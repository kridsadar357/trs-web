"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";

interface PortfolioItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  client: string | null;
  category: string | null;
  technologies: string[];
  imageUrl: string | null;
  featured: boolean;
  published: boolean;
}

export default function AdminPortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([]);

  useEffect(() => {
    fetch("/api/admin/portfolio")
      .then((r) => r.json())
      .then(setItems);
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this portfolio item?")) return;
    await fetch(`/api/admin/portfolio/${id}`, { method: "DELETE" });
    setItems(items.filter((i) => i.id !== id));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-heading text-2xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your portfolio items</p>
        </div>
        <Link href="/admin/portfolio/new">
          <Button className="gap-2"><Plus className="h-4 w-4" /> Add Item</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((item) => (
          <Card key={item.id} className="overflow-hidden group">
            <div className="h-32 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center relative">
              <span className="text-muted-foreground text-sm">{item.category || "No category"}</span>
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Link href={`/admin/portfolio/${item.id}`}>
                  <Button variant="secondary" size="icon" className="h-7 w-7">
                    <Pencil className="h-3 w-3" />
                  </Button>
                </Link>
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleDelete(item.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium text-sm">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.client}</p>
                </div>
                <div className="flex gap-1">
                  {item.featured && <Badge variant="secondary" className="text-xs">Featured</Badge>}
                  <Badge variant={item.published ? "default" : "outline"} className="text-xs">
                    {item.published ? "Live" : "Draft"}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.description}</p>
              {Array.isArray(item.technologies) && item.technologies.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.technologies.slice(0, 3).map((tech) => (
                    <Badge key={tech} variant="outline" className="text-xs">{tech}</Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
      {items.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">No portfolio items yet. Create your first one!</div>
      )}
    </div>
  );
}
