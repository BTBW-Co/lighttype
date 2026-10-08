"use client";

import { Header } from "@/components/layout/Header";
import { BuildingStudio } from "@/components/building/BuildingStudio";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BuildingPage() {
  return (
    <div className="min-h-full bg-background">
      <Header
        action={
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/create">Letters</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/building">Building tour</Link>
            </Button>
          </div>
        }
      />
      <BuildingStudio />
    </div>
  );
}
