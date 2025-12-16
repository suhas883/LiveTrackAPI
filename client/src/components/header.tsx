import React from "react";
import { Link } from "wouter";

export default function Header() {
  return (
    <header className="border-b p-4 flex items-center justify-between">
      <Link href="/" className="font-bold text-xl">LiveTrackAPI</Link>
    </header>
  );
}
