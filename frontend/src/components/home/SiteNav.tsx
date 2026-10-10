import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";
import { ADMIN_NAV_LINKS, isSuperAdmin } from "@/lib/admin";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/arcs", label: "Arcs" },
  { href: "/products", label: "Shop" },
  { href: "/founder", label: "Founder" },
  { href: "/scan", label: "QR Code" },
] as const;

type SiteNavProps = {
  tone?: "light" | "dark";
  /** When true, nav sits over hero frames (transparent). Shop pages use solid light bar. */
  overlay?: boolean;
};

export function SiteNav({ tone = "light", overlay = false }: SiteNavProps) {
  const isLight = tone === "light";
  const [open, setOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const cartCount = cart?.total_items || 0;
  const showAdmin = isSuperAdmin(user);

  const linkClass = (href: string) =>
    cn(
      "text-[11px] font-medium tracking-[0.28em] uppercase transition-colors",
      pathname === href || (href !== "/" && pathname.startsWith(href))
        ? isLight
          ? "text-neutral-950"
          : "text-white"
        : isLight
          ? "text-neutral-600 hover:text-neutral-950"
          : "text-white/80 hover:text-white",
    );

  return (
    <motion.header
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "pointer-events-none fixed top-0 right-0 left-0 z-50",
        !overlay && "border-b border-neutral-200/80 bg-[#F4F4F2]/95 backdrop-blur-md",
      )}
    >
      <div
        className={cn(
          "pointer-events-auto",
          overlay && (isLight ? "tf-nav-shell" : "tf-nav-shell--dark"),
        )}
      >
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-5 py-4 md:px-10 md:py-5">
          <Link
            to="/"
            className={cn(
              "tf-logo-mark font-sans text-[13px] font-semibold uppercase md:text-[15px]",
              isLight ? "tf-logo-mark--light" : "tf-logo-mark--dark",
            )}
          >
            Transfinity
          </Link>

          <nav className="hidden items-center gap-7 md:flex lg:gap-9">
            {LINKS.map((link) => (
              <Link key={link.label} to={link.href} className={linkClass(link.href)}>
                {link.label}
              </Link>
            ))}
            {showAdmin && (
              <div
                className="relative"
                onMouseEnter={() => setAdminOpen(true)}
                onMouseLeave={() => setAdminOpen(false)}
              >
                <Link
                  to="/admin"
                  className={cn(
                    linkClass("/admin"),
                    "inline-flex items-center gap-1.5 font-semibold",
                  )}
                >
                  <Shield className="size-3" strokeWidth={1.75} />
                  Admin
                </Link>
                <AnimatePresence>
                  {adminOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18 }}
                      className="absolute top-full left-1/2 z-50 mt-2 w-48 -translate-x-1/2 overflow-hidden rounded-2xl bg-white py-2 shadow-[0_18px_48px_rgba(17,17,17,0.12)] ring-1 ring-black/6"
                    >
                      {ADMIN_NAV_LINKS.map((link) => (
                        <Link
                          key={link.href}
                          to={link.href}
                          className={cn(
                            "block px-4 py-2.5 text-[11px] font-semibold tracking-[0.16em] uppercase transition-colors",
                            pathname === link.href || pathname.startsWith(`${link.href}/`)
                              ? "bg-neutral-950 text-white"
                              : "text-neutral-700 hover:bg-neutral-100",
                          )}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </nav>

          <div
            className={cn(
              "flex items-center gap-3 md:gap-5",
              isLight ? "text-neutral-800" : "text-white",
            )}
          >
            <Link
              to="/cart"
              aria-label="Cart"
              className="relative transition-opacity hover:opacity-70"
            >
              <ShoppingBag className="size-4" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 flex size-4 items-center justify-center rounded-full bg-neutral-950 text-[9px] text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {isAuthenticated ? (
              <div className="hidden items-center gap-4 md:flex">
                <Link
                  to="/profile"
                  className="text-[11px] tracking-[0.22em] uppercase opacity-80 hover:opacity-100"
                >
                  {user?.name || "Account"}
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                  }}
                  className="text-[11px] tracking-[0.22em] uppercase opacity-80 hover:opacity-100"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  to="/login"
                  className={cn(
                    "tf-sign-in",
                    !isLight && "tf-sign-in--on-dark",
                  )}
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={cn("tf-join", !isLight && "tf-join--light")}
                >
                  <span>Join</span>
                </Link>
              </div>
            )}

            <button
              type="button"
              className="md:hidden"
              aria-label="Menu"
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {open && (
          <div className="border-t border-neutral-200 bg-[#F4F4F2] px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setOpen(false)}
                  className="text-[12px] tracking-[0.28em] text-neutral-800 uppercase"
                >
                  {link.label}
                </Link>
              ))}
              {showAdmin && (
                <>
                  <p className="pt-1 text-[9px] font-semibold tracking-[0.28em] text-neutral-400 uppercase">
                    Super admin
                  </p>
                  {ADMIN_NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setOpen(false)}
                      className="text-[12px] font-semibold tracking-[0.28em] text-neutral-900 uppercase"
                    >
                      {link.label}
                    </Link>
                  ))}
                </>
              )}
              {isAuthenticated ? (
                <>
                  <Link to="/profile" onClick={() => setOpen(false)} className="text-[12px] tracking-[0.28em] uppercase">
                    Account
                  </Link>
                  <button
                    type="button"
                    className="text-left text-[12px] tracking-[0.28em] uppercase"
                    onClick={() => {
                      logout();
                      setOpen(false);
                      navigate("/");
                    }}
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="tf-sign-in tf-sign-in--block"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="tf-join tf-join--block"
                  >
                    <span>Join</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.header>
  );
}
