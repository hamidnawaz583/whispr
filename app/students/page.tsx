"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Person = { id: number; name: string; username: string };

function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

export default function StudentsPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [people, setPeople] = useState<Person[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const query = search.trim();
    if (!query) return;
    const timeout = window.setTimeout(async () => {
      setLoading(true); setSearched(true); setError("");
      try {
        const response = await fetch(`/api/people?search=${encodeURIComponent(query)}`, { credentials: "include", cache: "no-store" });
        const data = await response.json();
        if (response.status === 401) { router.replace("/login"); return; }
        if (!response.ok) throw new Error(data.message || "Unable to search people.");
        setPeople(data.users || []);
      } catch (cause) {
        setPeople([]);
        setError(cause instanceof Error ? cause.message : "Unable to search people.");
      } finally { setLoading(false); }
    }, 250);
    return () => window.clearTimeout(timeout);
  }, [router, search]);

  function handleSearch(value: string) {
    setSearch(value);
    if (!value.trim()) { setPeople([]); setSearched(false); setError(""); setLoading(false); }
  }

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    router.replace("/"); router.refresh();
  }

  return <main className="people-page people-page-refined">
    <aside className="people-sidebar">
      <Link href="/dashboard" className="people-logo"><span />whispr</Link>
      <nav className="people-nav" aria-label="Main navigation">
        <Link href="/dashboard" className="people-nav-item"><span className="people-nav-icon">⌂</span>Home</Link>
        <Link href="/messages" className="people-nav-item"><span className="people-nav-icon">◌</span>Messages</Link>
        <Link href="/students" className="people-nav-item active" aria-current="page"><span className="people-nav-icon">♧</span>People</Link>
      </nav>
      <div className="people-sidebar-bottom">
        <button type="button" className="people-nav-item people-logout" onClick={handleLogout}><span className="people-nav-icon">↪</span>Log out</button>
        <Link href="/account" className="people-account"><div className="people-account-avatar">W</div><div className="people-account-info"><strong>Your account</strong><span>Profile & settings</span></div></Link>
      </div>
    </aside>
    <section className="people-main">
      <header className="people-header"><div className="people-header-copy"><div className="people-eyebrow">PEOPLE DIRECTORY</div><h1>Find your next<br /><span>conversation.</span></h1><p>Search Whispr by name or username, view a profile, and start a private conversation when you are ready.</p></div><div className="people-header-mark" aria-hidden="true"><span>✦</span></div></header>
      <section className="people-search-section" aria-labelledby="find-people-heading"><div className="people-search-copy"><div className="people-search-label" id="find-people-heading">FIND PEOPLE</div><p>Search is private and only shows registered Whispr members.</p></div><div className="people-search-box"><span className="people-search-icon" aria-hidden="true">⌕</span><input type="search" value={search} onChange={(event) => handleSearch(event.target.value)} placeholder="Try a name or @username" aria-label="Search people by name or username" autoComplete="off" />{search && <button type="button" className="people-clear-search" onClick={() => handleSearch("")} aria-label="Clear search">×</button>}</div><div className="people-search-hint"><span>TIP</span> Use at least a few letters for more useful results.</div></section>
      <section className="people-results" aria-live="polite"><div className="people-results-heading"><div><div className="people-section-label">DIRECTORY</div><h2>{searched ? "People matching your search" : "Ready when you are"}</h2></div><span className="people-result-status">{loading ? "Searching…" : searched ? `${people.length} result${people.length === 1 ? "" : "s"}` : "Start with a search"}</span></div>{error && <div className="people-error" role="alert">{error}</div>}{!loading && searched && people.length > 0 && <div className="people-results-list">{people.map((person) => <Link key={person.id} href={`/person?id=${person.id}`} className="people-result-card"><div className="people-result-avatar">{initials(person.name)}</div><div className="people-result-info"><strong>{person.name}</strong><span>@{person.username}</span></div><span className="people-result-action">View profile <b>→</b></span></Link>)}</div>}{!loading && searched && people.length === 0 && !error && <EmptyState label="NO MATCHES" title="No people found." copy="Try checking the spelling or searching by a different name or username." />}{!searched && <EmptyState label="YOUR DIRECTORY" title="Find someone to talk to." copy="Enter a name or username above to discover people on Whispr." />}</section>
      <section className="people-quote"><div className="people-quote-symbol">“</div><div><p>Start a conversation with intention.<br /><span>It disappears when its time is up.</span></p><small>WHISPR PRIVATE BY DESIGN</small></div></section>
    </section>
  </main>;
}

function EmptyState({ label, title, copy }: { label: string; title: string; copy: string }) {
  return <div className="people-empty-state"><div className="people-empty-orbit"><div className="people-empty-icon">⌕</div></div><div className="people-empty-label">{label}</div><h3>{title}</h3><p>{copy}</p></div>;
}
