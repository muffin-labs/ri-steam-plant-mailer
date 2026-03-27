"use client";

import { useState, useEffect, useMemo, useRef } from "react";
// Renders description text with [img:/path.png] tags as images
function RichDescription({ text, className }) {
  if (!text) return null;
  const parts = text.split(/(\[img:[^\]]+\])/g);
  return (
    <div className={className}>
      {parts.map((part, i) => {
        const imgMatch = part.match(/^\[img:([^\]]+)\]$/);
        if (imgMatch) {
          return (
            <img
              key={i}
              src={imgMatch[1]}
              alt="Step illustration"
              className="my-3 w-full rounded-lg border border-navy-200 shadow-sm"
            />
          );
        }
        if (!part) return null;
        return part.split("\n").map((line, j) => (
          <p key={`${i}-${j}`} className="mb-1 last:mb-0">
            {line}
          </p>
        ));
      })}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="animate-pulse rounded-xl border border-navy-100 bg-white p-5">
      <div className="mb-3 h-5 w-2/3 rounded bg-navy-100" />
      <div className="mb-2 h-4 w-full rounded bg-navy-50" />
      <div className="h-4 w-1/2 rounded bg-navy-50" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4" aria-label="Loading campaigns">
      <SkeletonCard />
      <SkeletonCard />
    </div>
  );
}

function ErrorMessage({ message, onRetry }) {
  return (
    <div
      role="alert"
      className="rounded-xl border border-red-200 bg-red-50 p-6 text-center"
    >
      <p className="mb-1 font-semibold text-red-800">
        Something went wrong
      </p>
      <p className="mb-4 text-sm text-red-700">{message}</p>
      <button
        onClick={onRetry}
        className="inline-block rounded-lg bg-navy-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-navy-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500"
      >
        Try again
      </button>
    </div>
  );
}

function CampaignTypeBadge({ type }) {
  if (type === "clipboard") {
    return (
      <span className="inline-flex items-center whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-emerald-200 ring-inset">
        Web Form
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-navy-50 px-2.5 py-0.5 text-xs font-medium text-navy-700 ring-1 ring-navy-200 ring-inset">
      Email
    </span>
  );
}

export default function ActionPage() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Restore saved user info from localStorage
  function getSaved(key) {
    if (typeof window === "undefined") return "";
    try { return localStorage.getItem(`ri_mailer_${key}`) || ""; } catch { return ""; }
  }

  const [firstName, setFirstName] = useState(() => getSaved("firstName"));
  const [lastName, setLastName] = useState(() => getSaved("lastName"));
  const [address, setAddress] = useState(() => getSaved("address"));
  const [addressQuery, setAddressQuery] = useState(() => getSaved("address"));
  const [apt, setApt] = useState(() => getSaved("apt"));

  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [selectedRecipientIds, setSelectedRecipientIds] = useState(new Set());

  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressRef = useRef(null);
  const debounceRef = useRef(null);

  const [email, setEmail] = useState(() => getSaved("email"));

  // Persist user info to localStorage
  useEffect(() => {
    try {
      localStorage.setItem("ri_mailer_firstName", firstName);
      localStorage.setItem("ri_mailer_lastName", lastName);
      localStorage.setItem("ri_mailer_address", address);
      localStorage.setItem("ri_mailer_apt", apt);
      localStorage.setItem("ri_mailer_email", email);
    } catch { /* storage full or unavailable */ }
  }, [firstName, lastName, address, apt, email]);
  const [emailProvider, setEmailProvider] = useState(() => {
    const saved = getSaved("email");
    if (!saved) return null;
    const domain = (saved.split("@")[1] || "").toLowerCase();
    if (domain === "gmail.com" || domain === "googlemail.com") return "gmail";
    if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain)) return "outlook";
    if (["yahoo.com", "ymail.com", "yahoo.co.uk"].includes(domain)) return "yahoo";
    if (domain) return "other";
    return null;
  });
  const [sendStatus, setSendStatus] = useState(null); // "sent" | "copied" | "copied-form" | null
  const [copyError, setCopyError] = useState(null);

  async function fetchCampaigns() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/campaigns");
      if (!res.ok) throw new Error("Failed to load campaigns.");
      const data = await res.json();
      const active = data.campaigns || [];
      setCampaigns(active);
      if (active.length > 0) {
        setSelectedCampaignId(active[0].id);
        setSelectedRecipientIds(
          new Set(active[0].recipients.map((r) => r.id))
        );
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const autocompleteService = useRef(null);

  // Load Google Maps script dynamically
  useEffect(() => {
    if (window.google?.maps?.places) return;
    const existing = document.querySelector(
      'script[src*="maps.googleapis.com"]'
    );
    if (existing) return;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_PLACES_API_KEY}&libraries=places`;
    script.async = true;
    document.head.appendChild(script);
  }, []);

  function searchAddress(query) {
    if (query.length < 3) {
      setAddressSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    if (!window.google?.maps?.places) return;
    if (!autocompleteService.current) {
      autocompleteService.current =
        new window.google.maps.places.AutocompleteService();
    }

    setAddressLoading(true);
    const riCenter = new window.google.maps.LatLng(40.762, -73.95);
    autocompleteService.current.getPlacePredictions(
      {
        input: query,
        types: ["address"],
        componentRestrictions: { country: "us" },
        location: riCenter,
        radius: 5000,
      },
      (predictions, status) => {
        setAddressLoading(false);
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          const results = predictions.map((p) => ({
            placeId: p.place_id,
            main: p.structured_formatting.main_text,
            secondary: p.structured_formatting.secondary_text || "",
            full: p.description,
          }));
          setAddressSuggestions(results);
          setShowSuggestions(results.length > 0);
        } else {
          setAddressSuggestions([]);
          setShowSuggestions(false);
        }
      }
    );
  }

  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  function handleAddressChange(value) {
    setAddressQuery(value);
    setAddress(""); // clear confirmed address when user edits
    setHighlightedIndex(-1);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchAddress(value), 350);
  }

  function selectSuggestion(suggestion) {
    if (!suggestion?.full) return;
    // Remove ", USA" / ", United States" suffix for cleaner display
    const cleaned = suggestion.full.replace(/, (USA|United States)$/, "");
    setAddress(cleaned);
    setAddressQuery(cleaned);
    setShowSuggestions(false);
    setAddressSuggestions([]);
    setHighlightedIndex(-1);
  }

  function handleAddressKeyDown(e) {
    if (!showSuggestions || addressSuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < addressSuggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : addressSuggestions.length - 1
      );
    } else if (e.key === "Enter" && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(addressSuggestions[highlightedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  }

  function handleAddressBlur() {
    // Delay hiding so click on suggestion can fire first
    setTimeout(() => setShowSuggestions(false), 200);
  }

  const selectedCampaign = campaigns.find((c) => c.id === selectedCampaignId);

  function handleSelectCampaign(campaign) {
    setSelectedCampaignId(campaign.id);
    setSelectedRecipientIds(new Set(campaign.recipients.map((r) => r.id)));
    setSendStatus(null);
    setCopyError(null);
  }

  function toggleRecipient(id) {
    setSelectedRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function toggleAllRecipients() {
    if (!selectedCampaign) return;
    const allIds = selectedCampaign.recipients.map((r) => r.id);
    const allSelected = allIds.every((id) => selectedRecipientIds.has(id));
    if (allSelected) {
      setSelectedRecipientIds(new Set());
    } else {
      setSelectedRecipientIds(new Set(allIds));
    }
  }

  const isFormValid = firstName.trim() && lastName.trim() && address.trim();
  const fullAddress = apt.trim()
    ? `${address.trim()}, ${apt.trim()}`
    : address.trim();

  const renderedBody = useMemo(() => {
    if (!selectedCampaign) return "";
    let text = selectedCampaign.body_template || "";
    text = text.replace(
      /\{\{first_name\}\}/g,
      firstName.trim() || "[Your First Name]"
    );
    text = text.replace(
      /\{\{last_name\}\}/g,
      lastName.trim() || "[Your Last Name]"
    );
    text = text.replace(
      /\{\{address\}\}/g,
      fullAddress || "[Your Address]"
    );
    return text;
  }, [selectedCampaign, firstName, lastName, fullAddress]);

  const charCount = renderedBody.length;
  const isOverLimit = charCount > 1500;

  function detectProvider(addr) {
    const domain = (addr.split("@")[1] || "").toLowerCase();
    if (domain === "gmail.com" || domain === "googlemail.com") return "gmail";
    if (["outlook.com", "hotmail.com", "live.com", "msn.com"].includes(domain)) return "outlook";
    if (["yahoo.com", "ymail.com", "yahoo.co.uk"].includes(domain)) return "yahoo";
    if (domain) return "other";
    return null;
  }

  const [emailError, setEmailError] = useState("");

  function isValidEmail(addr) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(addr);
  }

  function handleEmailChange(value) {
    setEmail(value);
    if (emailError && isValidEmail(value)) setEmailError("");
    const detected = detectProvider(value);
    if (detected) setEmailProvider(detected);
  }

  function handleEmailBlur() {
    if (email && !isValidEmail(email)) {
      setEmailError("Please enter a valid email address.");
    } else {
      setEmailError("");
    }
  }

  function isMobile() {
    if (typeof navigator === "undefined") return false;
    return /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  }

  function buildComposeUrl(provider) {
    const recipients = selectedCampaign.recipients.filter((r) =>
      selectedRecipientIds.has(r.id)
    );
    if (recipients.length === 0) return null;

    const to = recipients.map((r) => r.email).join(",");
    const subject = selectedCampaign.subject || "";
    const body = renderedBody;
    const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // On mobile, mailto: is the most reliable way to open any email app with pre-filled content
    if (isMobile()) return mailto;

    switch (provider) {
      case "gmail":
        return `https://mail.google.com/mail/?view=cm&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      case "outlook":
        return `https://outlook.live.com/mail/0/deeplink/compose?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      case "yahoo":
        return `https://compose.mail.yahoo.com/?to=${encodeURIComponent(to)}&subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      default:
        return mailto;
    }
  }

  function handleSendEmail(provider) {
    if (!selectedCampaign || !isFormValid) return;
    const p = provider || emailProvider || "other";
    const url = buildComposeUrl(p);
    if (!url) return;
    if (isMobile() || p === "other") {
      window.location.href = url;
    } else {
      window.open(url, "_blank", "noopener");
    }
    setSendStatus("sent");
  }

  async function handleCopyToClipboard() {
    try {
      await navigator.clipboard.writeText(renderedBody);
      setCopyError(null);
      setSendStatus("copied");
    } catch {
      setCopyError("Could not copy automatically. Please select the text above and copy it manually.");
    }
  }

  async function handleCopyAndOpenForm() {
    if (!selectedCampaign) return;
    try {
      await navigator.clipboard.writeText(renderedBody);
      setCopyError(null);
      if (selectedCampaign.form_url) {
        window.open(selectedCampaign.form_url, "_blank", "noopener");
      }
      setSendStatus("copied-form");
    } catch {
      setCopyError("Could not copy automatically. Please select the text above and copy it manually.");
    }
  }

  const selectedRecipients = selectedCampaign
    ? selectedCampaign.recipients.filter((r) => selectedRecipientIds.has(r.id))
    : [];

  const allRecipientsSelected =
    selectedCampaign &&
    selectedCampaign.recipients.length > 0 &&
    selectedCampaign.recipients.every((r) => selectedRecipientIds.has(r.id));

  return (
    <main id="main" className="min-h-screen bg-navy-50/40">
      {/* Header */}
      <header className="border-b border-navy-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
          <a
            href="/"
            className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-navy-600 transition hover:text-navy-800"
          >
            <span aria-hidden="true">&larr;</span> Back to home
          </a>
          <h1 className="text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
            Take Action
          </h1>
          <p className="mt-2 text-navy-600">
            Fill in your info, pick a campaign, and send. Your email client will
            open with a ready-to-send letter.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        {/* Resident info form */}
        <section aria-labelledby="info-heading" className="mb-8">
          <h2
            id="info-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-500"
          >
            Your Information
          </h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label
                htmlFor="firstName"
                className="mb-1 block text-sm font-medium text-navy-800"
              >
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Jane"
                className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-navy-900 placeholder:text-navy-300 transition focus:border-navy-400 focus:ring-2 focus:ring-amber-500/30 focus-visible:outline-none"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="mb-1 block text-sm font-medium text-navy-800"
              >
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-navy-900 placeholder:text-navy-300 transition focus:border-navy-400 focus:ring-2 focus:ring-amber-500/30 focus-visible:outline-none"
              />
            </div>
            <div className="relative sm:col-span-2">
              <label
                htmlFor="address"
                className="mb-1 block text-sm font-medium text-navy-800"
              >
                Street Address <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    ref={addressRef}
                    id="address"
                    type="text"
                    required
                    autoComplete="off"
                    value={addressQuery}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    onKeyDown={handleAddressKeyDown}
                    onBlur={handleAddressBlur}
                    onFocus={() => {
                      if (addressSuggestions.length > 0) setShowSuggestions(true);
                    }}
                    placeholder="Start typing your address..."
                    className="w-full rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-navy-900 placeholder:text-navy-300 transition focus:border-navy-400 focus:ring-2 focus:ring-amber-500/30 focus-visible:outline-none"
                  />
                  {addressLoading && (
                    <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-navy-200 border-t-navy-500" />
                    </div>
                  )}
                </div>
                <input
                  id="apt"
                  type="text"
                  value={apt}
                  onChange={(e) => setApt(e.target.value)}
                  placeholder="Apt, Suite, etc."
                  className="w-32 rounded-lg border border-navy-200 bg-white px-3 py-2.5 text-navy-900 placeholder:text-navy-300 transition focus:border-navy-400 focus:ring-2 focus:ring-amber-500/30 focus-visible:outline-none"
                />
              </div>
              {showSuggestions && addressSuggestions.length > 0 && (
                <ul
                  className="absolute z-20 mt-1 w-full rounded-lg border border-navy-200 bg-white py-1 shadow-lg"
                  role="listbox"
                  aria-label="Address suggestions"
                >
                  {addressSuggestions.map((s, i) => (
                    <li
                      key={s.placeId || i}
                      role="option"
                      aria-selected={i === highlightedIndex}
                      className={`cursor-pointer px-3 py-2 text-sm text-navy-800 transition ${
                        i === highlightedIndex
                          ? "bg-navy-100"
                          : "hover:bg-navy-50"
                      }`}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => selectSuggestion(s)}
                    >
                      <span className="font-medium">{s.main}</span>
                      {s.secondary && (
                        <span className="ml-1 text-xs text-navy-400">
                          {s.secondary}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
              {addressQuery && !address && (
                <p className="mt-1 text-xs text-amber-600">
                  Please select an address from the suggestions.
                </p>
              )}
              {address && (
                <p className="mt-1 text-xs text-emerald-600">
                  &#10003; {fullAddress}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-medium text-navy-800"
              >
                Your Email{" "}
                <span className="font-normal text-navy-400">(for send method)</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="jane.doe@gmail.com"
                className={`w-full rounded-lg border bg-white px-3 py-2.5 text-navy-900 placeholder:text-navy-300 transition focus:ring-2 focus-visible:outline-none ${
                  emailError
                    ? "border-red-400 focus:border-red-400 focus:ring-red-500/30"
                    : "border-navy-200 focus:border-navy-400 focus:ring-amber-500/30"
                }`}
              />
              {emailError && (
                <p className="mt-1 text-xs text-red-600">{emailError}</p>
              )}
              {!emailError && emailProvider && emailProvider !== "other" && (
                <p className="mt-1 text-xs text-emerald-600">
                  {emailProvider === "gmail" && "We'll open Gmail for you"}
                  {emailProvider === "outlook" && "We'll open Outlook for you"}
                  {emailProvider === "yahoo" && "We'll open Yahoo Mail for you"}
                </p>
              )}
            </div>
          </div>
          {!isFormValid && (firstName || lastName || address) && (
            <p className="mt-2 text-xs text-navy-400">
              Please fill in all three fields to enable sending.
            </p>
          )}
        </section>

        {/* Campaigns */}
        <section aria-labelledby="campaigns-heading">
          <h2
            id="campaigns-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wide text-navy-500"
          >
            Choose a Campaign
          </h2>

          {loading && <LoadingSkeleton />}
          {error && <ErrorMessage message={error} onRetry={fetchCampaigns} />}

          {!loading && !error && campaigns.length === 0 && (
            <p className="rounded-xl border border-navy-100 bg-white p-6 text-center text-navy-500">
              No active campaigns right now. Check back soon.
            </p>
          )}

          {!loading && !error && campaigns.length > 0 && (
            <>
              {/* Campaign selector cards grouped by priority */}
              {(() => {
                const emailCampaigns = campaigns.filter((c) => c.type === "mailto");
                const formCampaigns = campaigns.filter((c) => c.type !== "mailto");
                const groups = [];
                if (emailCampaigns.length > 0)
                  groups.push({ label: "High Priority — Email Campaigns", campaigns: emailCampaigns });
                if (formCampaigns.length > 0)
                  groups.push({ label: "Additional Actions — Web Forms", campaigns: formCampaigns });
                return groups.map((group) => (
                  <div key={group.label} className="mb-6">
                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-navy-400">
                      {group.label}
                    </h3>
                    <div
                      className="grid grid-cols-1 gap-3 sm:grid-cols-2"
                      role="radiogroup"
                      aria-label={group.label}
                    >
                      {group.campaigns.map((campaign) => {
                  const isSelected = campaign.id === selectedCampaignId;
                  return (
                    <button
                      key={campaign.id}
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => handleSelectCampaign(campaign)}
                      className={`rounded-xl border-2 p-4 text-left transition ${
                        isSelected
                          ? "border-navy-600 bg-navy-900 text-white shadow-lg"
                          : "border-navy-100 bg-white text-navy-800 hover:border-navy-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <span className="font-semibold leading-snug">
                          {campaign.name}
                        </span>
                        <CampaignTypeBadge type={campaign.type} />
                      </div>
                      {campaign.description && (
                        <div
                          className={`mt-2 text-sm leading-relaxed ${
                            isSelected ? "text-navy-200" : "text-navy-500"
                          }`}
                        >
                          {campaign.description
                            .replace(/\[img:[^\]]+\]/g, "")
                            .trim()
                            .split(/\n+/)
                            .map((line, j) => {
                              const trimmed = line.trim();
                              if (!trimmed) return null;
                              const isStep = /^Step \d/i.test(trimmed);
                              return (
                                <p
                                  key={j}
                                  className={isStep ? "mt-1.5 first:mt-0" : "ml-4"}
                                >
                                  {isStep ? (
                                    <>
                                      <span className={`font-semibold ${isSelected ? "text-amber-300" : "text-navy-700"}`}>
                                        {trimmed.match(/^Step \d+:/)?.[0]}
                                      </span>
                                      {trimmed.replace(/^Step \d+:/, "")}
                                    </>
                                  ) : (
                                    trimmed
                                  )}
                                </p>
                              );
                            })}
                        </div>
                      )}
                    </button>
                  );
                })}
                    </div>
                  </div>
                ));
              })()}

              {/* Selected campaign detail */}
              {selectedCampaign && (
                <div className="space-y-5">
                  {/* MAILTO TYPE */}
                  {selectedCampaign.type === "mailto" && (
                    <>
                      {/* Recipients */}
                      {selectedCampaign.recipients.length > 0 && (
                        <div>
                          <div className="mb-2 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-navy-700">
                              Recipients
                            </h3>
                            <button
                              onClick={toggleAllRecipients}
                              className="text-xs font-medium text-navy-500 underline underline-offset-2 transition hover:text-navy-700"
                            >
                              {allRecipientsSelected
                                ? "Deselect All"
                                : "Select All"}
                            </button>
                          </div>
                          <div className="space-y-2">
                            {selectedCampaign.recipients.map((r) => (
                              <label
                                key={r.id}
                                className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition ${
                                  selectedRecipientIds.has(r.id)
                                    ? "border-navy-300 bg-navy-50"
                                    : "border-navy-100 bg-white"
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedRecipientIds.has(r.id)}
                                  onChange={() => toggleRecipient(r.id)}
                                  className="mt-0.5 h-5 w-5 shrink-0 cursor-pointer rounded border-navy-300 text-navy-600 accent-navy-700"
                                />
                                <span className="min-w-0">
                                  <span className="block text-sm font-medium text-navy-900">
                                    {r.name}
                                  </span>
                                  {r.title && (
                                    <span className="block text-xs text-navy-500">
                                      {r.title}
                                    </span>
                                  )}
                                  <span className="block text-xs text-navy-400">
                                    {r.email}
                                  </span>
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Letter preview */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <h3 className="text-sm font-semibold text-navy-700">
                            Letter Preview
                          </h3>
                          <span
                            className={`text-xs font-medium ${
                              isOverLimit ? "text-red-600" : "text-navy-400"
                            }`}
                          >
                            {charCount.toLocaleString()} characters
                            {isOverLimit && " (long emails may be truncated)"}
                          </span>
                        </div>
                        <div className="rounded-xl border border-navy-200 bg-amber-50/40 p-4 sm:p-6">
                          {selectedCampaign.subject && (
                            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-navy-400">
                              Subject: {selectedCampaign.subject}
                            </p>
                          )}
                          <div
                            className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-navy-800"
                            aria-label="Letter body preview"
                          >
                            {renderedBody}
                          </div>
                        </div>
                      </div>

                      {/* Send via provider */}
                      <div>
                        <h3 className="mb-3 text-sm font-semibold text-navy-700">
                          Send With
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: "gmail", label: "Gmail", color: "bg-red-500 hover:bg-red-600" },
                            { id: "outlook", label: "Outlook", color: "bg-blue-500 hover:bg-blue-600" },
                            { id: "yahoo", label: "Yahoo Mail", color: "bg-purple-500 hover:bg-purple-600" },
                            { id: "other", label: "Other / Default App", color: "bg-navy-600 hover:bg-navy-700" },
                          ].map(({ id, label, color }) => (
                            <button
                              key={id}
                              onClick={() => handleSendEmail(id)}
                              disabled={
                                !isFormValid || selectedRecipients.length === 0
                              }
                              className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold text-white shadow-md transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50 ${color} ${
                                emailProvider === id
                                  ? "ring-2 ring-amber-400 ring-offset-2"
                                  : ""
                              }`}
                            >
                              {label}
                              {emailProvider === id && (
                                <span className="text-xs font-normal opacity-80">
                                  (detected)
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                        {!email && (
                          <p className="mt-2 text-xs text-navy-400">
                            Enter your email above to auto-detect your provider, or just pick one.
                          </p>
                        )}
                      </div>

                      {/* Copy fallback */}
                      <div>
                        <button
                          onClick={handleCopyToClipboard}
                          disabled={!isFormValid}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy-200 bg-white px-6 py-3 text-sm font-semibold text-navy-700 transition hover:border-navy-300 hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                            />
                          </svg>
                          Or copy letter to clipboard
                        </button>
                      </div>

                      {/* Status messages */}
                      {sendStatus === "sent" && (
                        <div
                          role="status"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                        >
                          {emailProvider && emailProvider !== "other"
                            ? `Your ${emailProvider === "gmail" ? "Gmail" : emailProvider === "outlook" ? "Outlook" : "Yahoo Mail"} compose window should be open — review and hit send!`
                            : "Check your email app — your message should be ready to send!"}
                        </div>
                      )}
                      {sendStatus === "copied" && (
                        <div
                          role="status"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                        >
                          Copied to clipboard. Paste it into your email.
                        </div>
                      )}
                      {copyError && (
                        <div
                          role="alert"
                          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                          {copyError}
                        </div>
                      )}
                    </>
                  )}

                  {/* CLIPBOARD TYPE */}
                  {selectedCampaign.type === "clipboard" && (
                    <>
                      {/* Step-by-step instructions */}
                      {selectedCampaign.description && (
                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-6">
                          <h3 className="mb-2 text-sm font-semibold text-navy-700">
                            Instructions
                          </h3>
                          <RichDescription
                            text={selectedCampaign.description}
                            className="text-sm leading-relaxed text-navy-700"
                          />
                        </div>
                      )}

                      {/* Text preview */}
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-navy-700">
                          Text Preview
                        </h3>
                        <div className="rounded-xl border border-navy-200 bg-amber-50/40 p-4 sm:p-6">
                          <div
                            className="whitespace-pre-wrap font-serif text-sm leading-relaxed text-navy-800"
                            aria-label="Text preview"
                          >
                            {renderedBody}
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-3 sm:flex-row">
                        {selectedCampaign.form_url && (
                          <button
                            onClick={handleCopyAndOpenForm}
                            disabled={!isFormValid}
                            className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-500 px-6 py-3.5 text-base font-bold text-white shadow-md transition hover:bg-amber-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              strokeWidth={2}
                              stroke="currentColor"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
                              />
                            </svg>
                            Copy Text &amp; Open Form
                          </button>
                        )}
                        <button
                          onClick={handleCopyToClipboard}
                          disabled={!isFormValid}
                          className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-navy-200 bg-white px-6 py-3.5 text-base font-semibold text-navy-700 transition hover:border-navy-300 hover:bg-navy-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <svg
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={2}
                            stroke="currentColor"
                            aria-hidden="true"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9.75a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184"
                            />
                          </svg>
                          Copy to Clipboard
                        </button>
                      </div>

                      {/* Status messages */}
                      {sendStatus === "copied-form" && (
                        <div
                          role="status"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                        >
                          Text copied! Paste it into the form that just opened.
                        </div>
                      )}
                      {sendStatus === "copied" && (
                        <div
                          role="status"
                          className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800"
                        >
                          Copied to clipboard.
                        </div>
                      )}
                      {copyError && (
                        <div
                          role="alert"
                          className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        >
                          {copyError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </main>
  );
}
