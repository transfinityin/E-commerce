import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingBag, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { cn } from "@/lib/utils";
import useAuthStore from "@/store/authStore";
import useCartStore from "@/store/cartStore";

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
  const { isAuthenticated, user, logout } = useAuthStore();
  const cart = useCartStore((s) => s.cart);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const cartCount = cart?.total_items || 0;

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
              <div className="hidden items-center gap-4 md:flex">
                <Link
                  to="/login"
                  className="text-[11px] tracking-[0.22em] uppercase opacity-80 hover:opacity-100"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className={cn(
                    "inline-flex h-9 items-center px-4 text-[11px] font-semibold tracking-[0.22em] uppercase",
                    isLight
                      ? "bg-neutral-950 text-white hover:bg-neutral-800"
                      : "bg-white text-neutral-950 hover:bg-neutral-100",
                  )}
                >
                  Join
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
                  <Link to="/login" onClick={() => setOpen(false)} className="text-[12px] tracking-[0.28em] uppercase">
                    Sign In
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="text-[12px] tracking-[0.28em] uppercase">
                    Join
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
