"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useSettings } from "@/features/cms/settings-context";
import CartBadge from "./CartBadge";
import SearchModal from "./SearchModal";
import { getCategories } from "@/lib/api/categories";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "New Arrivals", href: "/collections/new" },
];

export default function Header() {
  const { data: session, status } = useSession();
  useSettings();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuData, setMenuData] = useState({ MEN: [], WOMEN: [], KIDS: [] });
  const [openMenu, setOpenMenu] = useState(null);
  const [expandedGender, setExpandedGender] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef(null);
  const menuTimeoutRef = useRef(null);

  const isAdmin = session?.user?.role === "ADMIN";

  useEffect(() => {
    async function fetchMenu() {
      try {
        const data = await getCategories();
        const structured = { MEN: [], WOMEN: [], KIDS: [] };
        for (const parent of data.categories) {
          if (parent.gender === "MEN" && parent.children) {
            structured.MEN.push(...parent.children);
          } else if (parent.gender === "WOMEN" && parent.children) {
            structured.WOMEN.push(...parent.children);
          } else if (parent.gender === "KIDS" && parent.children) {
            structured.KIDS.push(...parent.children);
          }
        }
        setMenuData(structured);
      } catch {
        // fallback: nav still works with plain links
      }
    }
    fetchMenu();
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const handleLogout = () => {
    setDropdownOpen(false);
    setMenuOpen(false);
    signOut({ callbackUrl: "/" });
  };

  const closeMenu = () => setMenuOpen(false);

  const handleMenuEnter = (gender) => {
    clearTimeout(menuTimeoutRef.current);
    setOpenMenu(gender);
  };

  const handleMenuLeave = () => {
    menuTimeoutRef.current = setTimeout(() => setOpenMenu(null), 120);
  };

  const renderDropdown = (gender, items) => {
    const label = gender === "MEN" ? "Men" : gender === "WOMEN" ? "Women" : "Kids";
    const viewAllHref = `/collections/${label.toLowerCase()}`;

    return (
      <div
        className="absolute left-0 top-full pt-2 z-50"
        onMouseEnter={() => handleMenuEnter(gender)}
        onMouseLeave={handleMenuLeave}
      >
        <div
          className="bg-white shadow-lg rounded-b-lg border-t py-3 min-w-[240px]"
          style={{ borderColor: "var(--border)" }}
        >
          <Link
            href={viewAllHref}
            onClick={() => setOpenMenu(null)}
            className="block px-6 py-2 text-sm font-semibold transition-colors"
            style={{ color: "var(--text-primary)" }}
            onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-soft)"}
            onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
          >
            View All {label}
          </Link>
          <div className="my-1 mx-4" style={{ borderTop: "1px solid var(--border)" }} />
          {items.length > 0 ? (
            items.map((item) => (
              <Link
                key={item.id}
                href={`/collections/${item.slug}`}
                onClick={() => setOpenMenu(null)}
                className="block px-6 py-2.5 text-sm transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "var(--text-primary)";
                  e.currentTarget.style.background = "var(--surface-soft)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "var(--text-secondary)";
                  e.currentTarget.style.background = "transparent";
                }}
              >
                {item.name}
              </Link>
            ))
          ) : (
            <Link
              href={viewAllHref}
              onClick={() => setOpenMenu(null)}
              className="block px-6 py-2.5 text-sm transition-colors"
              style={{ color: "var(--text-muted)" }}
              onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-soft)"}
              onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
            >
              Browse {label}
            </Link>
          )}
        </div>
      </div>
    );
  };

  const renderAccordion = (gender, label, items) => {
    const isOpen = expandedGender === gender;
    const viewAllHref = `/collections/${label.toLowerCase()}`;

    return (
      <div>
        <button
          onClick={() => setExpandedGender(isOpen ? null : gender)}
          className="flex items-center justify-between w-full py-2.5 px-3 rounded-lg text-left"
          style={{ color: "var(--text-secondary)" }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-soft)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
        >
          <span>{label}</span>
          <svg
            className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <div className="pl-4 pb-1">
              <Link
                href={viewAllHref}
                onClick={closeMenu}
                className="block py-2 pl-3 pr-3 text-sm font-semibold rounded-lg"
                style={{ color: "var(--text-primary)" }}
                onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-soft)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                View All {label}
              </Link>
              {items.length > 0 ? (
                items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/collections/${item.slug}`}
                    onClick={closeMenu}
                    className="block py-2 pl-3 pr-3 text-sm rounded-lg"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) => e.currentTarget.style.background = "var(--surface-soft)"}
                    onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
                  >
                    {item.name}
                  </Link>
                ))
              ) : (
                <Link
                  href={viewAllHref}
                  onClick={closeMenu}
                  className="block py-2 pl-3 pr-3 text-sm rounded-lg"
                  style={{ color: "var(--text-muted)" }}
                >
                  Browse {label}
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: "var(--surface)", borderColor: "var(--border)" }}
    >
      <div className="container-page">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href="/" aria-label="WEJ Shoes - Home">
              Wej Shoes New
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

            {/* Men dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter("MEN")}
              onMouseLeave={handleMenuLeave}
            >
              <Link
                href="/collections/men"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{
                  color:
                    openMenu === "MEN"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                Men
                <svg
                  className={`w-3.5 h-3.5 pointer-events-none transition-transform duration-150 ${openMenu === "MEN" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              {openMenu === "MEN" && renderDropdown("MEN", menuData.MEN)}
            </div>

            {/* Women dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter("WOMEN")}
              onMouseLeave={handleMenuLeave}
            >
              <Link
                href="/collections/women"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{
                  color:
                    openMenu === "WOMEN"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                Women
                <svg
                  className={`w-3.5 h-3.5 pointer-events-none transition-transform duration-150 ${openMenu === "WOMEN" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              {openMenu === "WOMEN" && renderDropdown("WOMEN", menuData.WOMEN)}
            </div>

            {/* Kids dropdown */}
            <div
              className="relative"
              onMouseEnter={() => handleMenuEnter("KIDS")}
              onMouseLeave={handleMenuLeave}
            >
              <Link
                href="/collections/kids"
                className="flex items-center gap-1.5 text-sm font-medium transition-colors"
                style={{
                  color:
                    openMenu === "KIDS"
                      ? "var(--text-primary)"
                      : "var(--text-secondary)",
                }}
              >
                Kids
                <svg
                  className={`w-3.5 h-3.5 pointer-events-none transition-transform duration-150 ${openMenu === "KIDS" ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </Link>
              {openMenu === "KIDS" && renderDropdown("KIDS", menuData.KIDS)}
            </div>
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Search products"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            <CartBadge />

            <div className="hidden md:block" ref={dropdownRef}>
              {status === "loading" ? (
                <span
                  className="text-sm"
                  style={{ color: "var(--text-muted)" }}
                >
                  ...
                </span>
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
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>

                  {dropdownOpen && (
                    <div
                      className="absolute right-0 mt-2 w-48 rounded-lg py-2 z-50"
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--border)",
                        boxShadow: "var(--shadow-lg)",
                      }}
                    >
                      <Link
                        href="/account"
                        onClick={() => setDropdownOpen(false)}
                        className="block px-4 py-2 text-sm"
                        style={{ color: "var(--text-secondary)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-soft)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
                      >
                        My Account
                      </Link>
                      {isAdmin && (
                        <Link
                          href="/admin/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="block px-4 py-2 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background =
                              "var(--surface-soft)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          Admin Panel
                        </Link>
                      )}
                      <hr
                        style={{
                          borderColor: "var(--border)",
                          margin: "0.25rem 0",
                        }}
                      />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm"
                        style={{ color: "var(--danger)" }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background =
                            "var(--surface-soft)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.background = "transparent")
                        }
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
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2"
              style={{ color: "var(--text-secondary)" }}
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop - always mounted, fades via opacity */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity duration-300 ease-out ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Drawer panel - always mounted, slides via transform */}
      <div
        className={`fixed inset-y-0 right-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl transform transition-transform duration-300 ease-out md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <span className="font-semibold text-gray-900">Menu</span>
          <button
            onClick={closeMenu}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close menu"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="overflow-y-auto h-[calc(100%-60px)] p-4 space-y-1">
          {/* Home */}
          <Link
            href="/"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface-soft)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Home
          </Link>

          {/* Men accordion */}
          {renderAccordion("MEN", "Men", menuData.MEN)}

          {/* Women accordion */}
          {renderAccordion("WOMEN", "Women", menuData.WOMEN)}

          {/* Kids accordion */}
          {renderAccordion("KIDS", "Kids", menuData.KIDS)}

          {/* New Arrivals */}
          <Link
            href="/collections/new"
            onClick={closeMenu}
            className="block py-2.5 px-3 rounded-lg transition-colors"
            style={{ color: "var(--text-secondary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--surface-soft)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            New Arrivals
          </Link>

          <div
            style={{
              borderTop: "1px solid var(--border)",
              paddingTop: "0.75rem",
              marginTop: "0.5rem",
            }}
          >
            {session ? (
              <>
                <Link
                  href="/account"
                  onClick={closeMenu}
                  className="block py-2.5 px-3 rounded-lg transition-colors"
                  style={{ color: "var(--text-secondary)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-soft)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  My Account
                </Link>
                {isAdmin && (
                  <Link
                    href="/admin/dashboard"
                    onClick={closeMenu}
                    className="block py-2.5 px-3 rounded-lg transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "var(--surface-soft)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    Admin Panel
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left py-2.5 px-3 rounded-lg transition-colors"
                  style={{ color: "var(--danger)" }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--surface-soft)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "transparent")
                  }
                >
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/login"
                onClick={closeMenu}
                className="block py-2.5 px-3 rounded-lg transition-colors"
                style={{ color: "var(--text-secondary)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--surface-soft)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "transparent")
                }
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  );
}
