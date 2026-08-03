"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/initials";
import {
  BookmarkIcon,
  ChevronDownIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  StarIcon,
  UserIcon,
  XIcon,
} from "@/components/icons";

interface NavLink {
  label: string;
  href: string;
}

interface NavUser {
  email: string;
  initials: string;
}

const PARENT_LINKS: NavLink[] = [
  { label: "Find companies", href: "/companies" },
  { label: "How it works", href: "/how-it-works" },
];

const EMPLOYER_LINKS: NavLink[] = [
  { label: "Dashboard", href: "/employers/dashboard" },
  { label: "Reviews", href: "/employers/reviews" },
  { label: "Job listings", href: "/employers/jobs" },
  { label: "Assessment", href: "/employers/assessment" },
  { label: "Billing", href: "/employers/billing" },
];

function useNavUser(): NavUser | null {
  const [user, setUser] = useState<NavUser | null>(null);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email;
      setUser(email ? { email, initials: getInitials(email) } : null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email;
      setUser(email ? { email, initials: getInitials(email) } : null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return user;
}

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function reviewHrefFor(pathname: string) {
  const match = pathname.match(/^\/companies\/([^/]+)/);
  return match ? `/companies/${match[1]}/review` : "/companies";
}

export function Navbar() {
  const pathname = usePathname() ?? "/";
  const isEmployerMode = pathname.startsWith("/employers");
  const user = useNavUser();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const navLinks = isEmployerMode ? EMPLOYER_LINKS : PARENT_LINKS;
  const reviewHref = reviewHrefFor(pathname);
  const showBottomTabBar = Boolean(user) && !isEmployerMode;

  return (
    <>
      <div
        className={`hidden h-9 items-center bg-azure-mid px-8 md:flex ${
          isEmployerMode ? "justify-start" : "justify-end"
        }`}
      >
        {isEmployerMode ? (
          <Link href="/companies" className="text-[13px] text-white/80 hover:text-white">
            ← Back to Copeepl
          </Link>
        ) : (
          <div className="flex items-center gap-5">
            <Link href="/employers" className="text-[13px] font-semibold text-teal">
              For employers →
            </Link>
            <Link href="/help" className="text-[13px] text-white/60 hover:text-white/80">
              Help
            </Link>
          </div>
        )}
      </div>

      <div className="flex h-[59px] items-center justify-between bg-azure px-8">
        <Link href="/companies" className="shrink-0 font-serif text-xl text-white">
          cope<span className="text-teal">epl</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-[13px] transition-colors ${
                isActive(pathname, link.href) ? "text-white" : "text-white/65 hover:text-white"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href={reviewHref}
            className="inline-flex items-center gap-1.5 rounded-full bg-crimson px-4 py-2 text-xs font-semibold text-white"
          >
            <HeartIcon className="h-3.5 w-3.5" />
            Leave a review
          </Link>

          {user ? (
            <AccountMenu
              user={user}
              isEmployerMode={isEmployerMode}
              open={accountOpen}
              onToggle={() => setAccountOpen((open) => !open)}
              onClose={() => setAccountOpen(false)}
            />
          ) : (
            <>
              <Link href="/login" className="text-[13px] text-white/70 hover:text-white">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-full bg-teal px-4 py-2 text-xs font-semibold text-azure"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 md:hidden">
          <Link
            href={reviewHref}
            aria-label="Leave a review"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-crimson text-white"
          >
            <HeartIcon className="h-4 w-4" />
          </Link>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setDrawerOpen(true)}
            className="text-white"
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {drawerOpen && (
        <MobileDrawer
          isEmployerMode={isEmployerMode}
          navLinks={navLinks}
          user={user}
          reviewHref={reviewHref}
          onClose={() => setDrawerOpen(false)}
        />
      )}

      {showBottomTabBar && <BottomTabBar pathname={pathname} reviewHref={reviewHref} />}
    </>
  );
}

function AccountMenu({
  user,
  isEmployerMode,
  open,
  onToggle,
  onClose,
}: {
  user: NavUser;
  isEmployerMode: boolean;
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
}) {
  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    onClose();
  }

  return (
    <div className="relative">
      <button type="button" onClick={onToggle} className="flex items-center gap-1.5">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold ${
            isEmployerMode ? "bg-crimson text-white" : "bg-teal text-azure"
          }`}
        >
          {user.initials}
        </span>
        <ChevronDownIcon className={`h-4 w-4 text-white/70 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={onClose} />
          <div className="absolute right-0 top-full z-50 mt-2 w-52 rounded-lg border border-warm-mid bg-white p-2">
            <p className="truncate px-2 py-1.5 text-xs text-ink-light">{user.email}</p>
            <Link
              href="/account"
              onClick={onClose}
              className="block rounded-md px-2 py-1.5 text-sm text-ink hover:bg-warm"
            >
              Account settings
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="block w-full rounded-md px-2 py-1.5 text-left text-sm text-ink hover:bg-warm"
            >
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function MobileDrawer({
  isEmployerMode,
  navLinks,
  user,
  reviewHref,
  onClose,
}: {
  isEmployerMode: boolean;
  navLinks: NavLink[];
  user: NavUser | null;
  reviewHref: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-azure md:hidden">
      <div className="flex h-[59px] items-center justify-between px-8">
        <span className="font-serif text-xl text-white">
          cope<span className="text-teal">epl</span>
        </span>
        <button type="button" aria-label="Close menu" onClick={onClose} className="text-white">
          <XIcon />
        </button>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-8 py-4">
        {isEmployerMode ? (
          <Link
            href="/companies"
            onClick={onClose}
            className="mb-4 text-[13px] font-semibold text-teal"
          >
            ← Back to Copeepl
          </Link>
        ) : (
          <Link
            href="/employers"
            onClick={onClose}
            className="mb-4 text-[13px] font-semibold text-teal"
          >
            For employers →
          </Link>
        )}

        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="border-b border-white/10 py-3 text-[15px] text-white"
          >
            {link.label}
          </Link>
        ))}

        <Link
          href={reviewHref}
          onClick={onClose}
          className="mt-6 flex items-center justify-center gap-2 rounded-full bg-crimson px-5 py-3 text-sm font-semibold text-white"
        >
          <HeartIcon className="h-4 w-4" />
          Leave a review
        </Link>

        <div className="mt-4 flex flex-col gap-2">
          {user ? (
            <>
              <p className="mb-1 truncate text-center text-xs text-white/50">{user.email}</p>
              <Link
                href="/account"
                onClick={onClose}
                className="rounded-full border border-white/20 px-5 py-3 text-center text-sm text-white"
              >
                Account settings
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={onClose}
                className="rounded-full border border-white/20 px-5 py-3 text-center text-sm text-white"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                onClick={onClose}
                className="rounded-full bg-teal px-5 py-3 text-center text-sm font-semibold text-azure"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function BottomTabBar({ pathname, reviewHref }: { pathname: string; reviewHref: string }) {
  const leftTabs = [
    { label: "Find", href: "/companies", Icon: SearchIcon },
    { label: "Saved", href: "/saved", Icon: BookmarkIcon },
  ];
  const rightTabs = [
    { label: "Reviews", href: "/reviews", Icon: StarIcon },
    { label: "Account", href: "/account", Icon: UserIcon },
  ];

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 flex h-16 items-center justify-between border-t border-warm-mid bg-white px-2 md:hidden">
      {leftTabs.map((tab) => (
        <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
      ))}

      <Link
        href={reviewHref}
        aria-label="Leave a review"
        className="-mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-crimson text-white"
      >
        <HeartIcon className="h-5 w-5" />
      </Link>

      {rightTabs.map((tab) => (
        <TabLink key={tab.href} {...tab} active={isActive(pathname, tab.href)} />
      ))}
    </nav>
  );
}

function TabLink({
  label,
  href,
  Icon,
  active,
}: {
  label: string;
  href: string;
  Icon: (props: { className?: string }) => React.JSX.Element;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-1 flex-col items-center gap-1 text-[11px] ${
        active ? "text-teal" : "text-ink-light"
      }`}
    >
      <Icon className="h-5 w-5" />
      {label}
    </Link>
  );
}
