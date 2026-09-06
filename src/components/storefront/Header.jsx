"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useSettings } from "@/features/cms/settings-context";
import CartBadge from "./CartBadge";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "Men", href: "/collections/men" },
  { label: "Women", href: "/collections/women" },
  { label: "New Arrivals", href: "/collections/new" },
];

export default function Header() {
  const { data: session, status } = useSession();
  const { storeName, logoUrl } = useSettings();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
    signOut({ callbackUrl: "/" });
  };

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="h-8 w-auto" />
              ) : (
                <span className="font-display">{storeName}</span>
              )}
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium link"
                style={{ color: "var(--text-secondary)" }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/search"
              className="p-2 link"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>

            <CartBadge />

            <div className="hidden md:block" ref={dropdownRef}>
              {status === "loading" ? (
                <span className="text-sm" style={{ color: "var(--text-muted)" }}>...</span>
              ) : session ? (
                <div className="relative">
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="flex items-center gap-1 text-sm font-medium link"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {session.user.name || "Account"}
                    <svg
                      className={`w-4 h-4 transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-lg py-2 z-50"
                      style={{ background: "var(--surface)", border: "1px solid var(--border)", boxShadow: "var(--shadow-lg)" }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                      >
                        My Account
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                          onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <hr style={{ borderColor: "var(--border)", margin: "0.25rem 0" }} />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm"
                        style={{ color: "var(--danger)" }}
                        onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="text-sm font-medium link"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Login
                </Link>
              )}
            </div>

            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2"
              style={{ color: "var(--text-secondary)" }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0"
            style={{ background: "rgba(28, 25, 23, 0.5)" }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="absolute right-0 top-0 h-full w-72 shadow-xl"
            style={{ background: "var(--surface)" }}
          >
            <div
              className="flex items-center justify-between p-4"
              style={{ borderBottom: "1px solid var(--border)" }}
            >
              <span className="font-bold text-lg" style={{ color: "var(--text-primary)" }}>Menu</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-2"
                style={{ color: "var(--text-secondary)" }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="p-4 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-lg"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                  onMouseLeave={(e) => e.target.style.background = "transparent"}
                >
                  {link.label}
                </Link>
              ))}
              <div style={{ borderTop: "1px solid var(--border)", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                {session ? (
                  <>
                    <Link
                      href="/account"
                      onClick={() => setMobileMenuOpen(false)}
                      className="block py-2 px-3 rounded-lg"
                      style={{ color: "var(--text-secondary)" }}
                      onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      My Account
                    </Link>
                    {isAdmin && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setMobileMenuOpen(false)}
                        className="block py-2 px-3 rounded-lg"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                        onMouseLeave={(e) => e.target.style.background = "transparent"}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left py-2 px-3 rounded-lg"
                      style={{ color: "var(--danger)" }}
                      onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                      onMouseLeave={(e) => e.target.style.background = "transparent"}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block py-2 px-3 rounded-lg"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.target.style.background = "var(--surface-soft)"}
                    onMouseLeave={(e) => e.target.style.background = "transparent"}
                  >
                    Login
                  </Link>
                )}
              </div>
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
