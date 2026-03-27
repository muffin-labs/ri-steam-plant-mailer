"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";

// ---------------------------------------------------------------------------
// Toast notification component
// ---------------------------------------------------------------------------
function Toast({ message, type, onDismiss }) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const bg =
    type === "error"
      ? "bg-red-600"
      : type === "success"
        ? "bg-emerald-600"
        : "bg-navy-700";

  return (
    <div
      role="status"
      aria-live="polite"
      className={`fixed bottom-6 right-6 z-50 rounded-md px-5 py-3 text-sm font-medium text-white shadow-lg ${bg} animate-fade-in`}
    >
      {message}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Merge field buttons for template editor
// ---------------------------------------------------------------------------
const MERGE_FIELDS = [
  { label: "First Name", value: "{{first_name}}" },
  { label: "Last Name", value: "{{last_name}}" },
  { label: "Address", value: "{{address}}" },
];

function MergeFieldBar({ textareaRef }) {
  function insert(value) {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const text = el.value;
    const before = text.slice(0, start);
    const after = text.slice(end);
    const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value",
    ).set;
    nativeInputValueSetter.call(el, before + value + after);
    el.dispatchEvent(new Event("input", { bubbles: true }));
    const cursor = start + value.length;
    el.setSelectionRange(cursor, cursor);
  }

  return (
    <div className="mb-1 flex flex-wrap gap-1.5">
      <span className="text-xs text-navy-500 leading-6 mr-1">
        Insert field:
      </span>
      {MERGE_FIELDS.map((f) => (
        <button
          key={f.value}
          type="button"
          onClick={() => insert(f.value)}
          className="rounded border border-navy-300 bg-navy-50 px-2 py-0.5 text-xs font-medium text-navy-700 hover:bg-navy-100 transition-colors"
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Recipient row (inline editing)
// ---------------------------------------------------------------------------
function RecipientRow({ recipient, onSave, onDelete, saving }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ ...recipient });

  function handleChange(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  function handleSave() {
    onSave(draft);
    setEditing(false);
  }

  function handleCancel() {
    setDraft({ ...recipient });
    setEditing(false);
  }

  if (!editing) {
    return (
      <tr className="border-b border-navy-100 last:border-b-0">
        <td className="py-2 pr-3 text-sm text-navy-900">{recipient.name}</td>
        <td className="py-2 pr-3 text-sm text-navy-600">{recipient.title}</td>
        <td className="py-2 pr-3 text-sm text-navy-600">{recipient.email}</td>
        <td className="py-2 pr-3 text-center">
          <span
            className={`inline-block h-2.5 w-2.5 rounded-full ${recipient.is_active ? "bg-emerald-500" : "bg-navy-300"}`}
            title={recipient.is_active ? "Active" : "Inactive"}
          />
        </td>
        <td className="py-2 text-right whitespace-nowrap">
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="mr-2 text-xs text-navy-500 hover:text-navy-700 underline"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete recipient "${recipient.name}"?`)) {
                onDelete(recipient.id);
              }
            }}
            className="text-xs text-red-500 hover:text-red-700 underline"
          >
            Delete
          </button>
        </td>
      </tr>
    );
  }

  return (
    <tr className="border-b border-navy-100 bg-amber-50/40">
      <td className="py-2 pr-2">
        <input
          type="text"
          value={draft.name}
          onChange={(e) => handleChange("name", e.target.value)}
          className="w-full rounded border border-navy-300 px-2 py-1 text-sm"
          aria-label="Name"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="text"
          value={draft.title || ""}
          onChange={(e) => handleChange("title", e.target.value)}
          className="w-full rounded border border-navy-300 px-2 py-1 text-sm"
          aria-label="Title"
        />
      </td>
      <td className="py-2 pr-2">
        <input
          type="email"
          value={draft.email}
          onChange={(e) => handleChange("email", e.target.value)}
          className="w-full rounded border border-navy-300 px-2 py-1 text-sm"
          aria-label="Email"
        />
      </td>
      <td className="py-2 pr-2 text-center">
        <button
          type="button"
          onClick={() => handleChange("is_active", !draft.is_active)}
          className={`inline-block h-4 w-8 rounded-full transition-colors ${draft.is_active ? "bg-emerald-500" : "bg-navy-300"} relative`}
          aria-label={draft.is_active ? "Set inactive" : "Set active"}
        >
          <span
            className={`absolute top-0.5 h-3 w-3 rounded-full bg-white shadow transition-transform ${draft.is_active ? "left-4" : "left-0.5"}`}
          />
        </button>
      </td>
      <td className="py-2 text-right whitespace-nowrap">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="mr-2 rounded bg-emerald-600 px-2 py-1 text-xs font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
        >
          Save
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="rounded border border-navy-300 px-2 py-1 text-xs text-navy-600 hover:bg-navy-50"
        >
          Cancel
        </button>
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// Add recipient form
// ---------------------------------------------------------------------------
function AddRecipientForm({ campaignId, onAdd, saving }) {
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [email, setEmail] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    onAdd({ campaign_id: campaignId, name: name.trim(), title: title.trim(), email: email.trim(), is_active: 1 });
    setName("");
    setTitle("");
    setEmail("");
  }

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex flex-wrap items-end gap-2">
      <div>
        <label className="block text-xs font-medium text-navy-600 mb-0.5">Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="rounded border border-navy-300 px-2 py-1 text-sm w-40"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-navy-600 mb-0.5">Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="rounded border border-navy-300 px-2 py-1 text-sm w-40"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-navy-600 mb-0.5">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="rounded border border-navy-300 px-2 py-1 text-sm w-52"
        />
      </div>
      <button
        type="submit"
        disabled={saving}
        className="rounded bg-navy-700 px-3 py-1 text-sm font-medium text-white hover:bg-navy-800 disabled:opacity-50 transition-colors"
      >
        Add
      </button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// Recipients panel for a campaign
// ---------------------------------------------------------------------------
function RecipientsPanel({ campaign, recipients, onUpdate, toast }) {
  const [saving, setSaving] = useState(false);

  const campaignRecipients = recipients.filter(
    (r) => r.campaign_id === campaign.id,
  );

  async function handleSaveRecipient(updated) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/recipients", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      onUpdate("update-recipient", data.recipient || data);
      toast("Recipient saved", "success");
    } catch {
      toast("Failed to save recipient", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleAddRecipient(newRecipient) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/recipients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRecipient),
      });
      if (!res.ok) throw new Error("Add failed");
      const data = await res.json();
      onUpdate("add-recipient", data.recipient || data);
      toast("Recipient added", "success");
    } catch {
      toast("Failed to add recipient", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteRecipient(id) {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/recipients", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onUpdate("delete-recipient", { id });
      toast("Recipient deleted", "success");
    } catch {
      toast("Failed to delete recipient", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-4 border-t border-navy-200 pt-4">
      <h4 className="mb-2 text-sm font-semibold text-navy-800">Recipients</h4>
      {campaignRecipients.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-navy-200 text-xs font-semibold uppercase tracking-wide text-navy-500">
                <th className="pb-2 pr-3">Name</th>
                <th className="pb-2 pr-3">Title</th>
                <th className="pb-2 pr-3">Email</th>
                <th className="pb-2 pr-3 text-center">Active</th>
                <th className="pb-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {campaignRecipients.map((r) => (
                <RecipientRow
                  key={r.id}
                  recipient={r}
                  onSave={handleSaveRecipient}
                  onDelete={handleDeleteRecipient}
                  saving={saving}
                />
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-sm text-navy-400 italic">No recipients yet.</p>
      )}
      <AddRecipientForm
        campaignId={campaign.id}
        onAdd={handleAddRecipient}
        saving={saving}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campaign card (expandable)
// ---------------------------------------------------------------------------
function CampaignCard({ campaign, recipients, onUpdate, toast }) {
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState({ ...campaign });
  const [saving, setSaving] = useState(false);
  const bodyRef = useRef(null);

  // Sync draft if campaign prop changes externally
  useEffect(() => {
    setDraft((prev) => {
      if (prev._synced === campaign.id && prev._rev === campaign._rev) return prev;
      return { ...campaign };
    });
  }, [campaign]);

  function handleChange(field, value) {
    setDraft((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      onUpdate("update-campaign", data.campaign || data);
      toast("Campaign saved", "success");
    } catch {
      toast("Failed to save campaign", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`Delete campaign "${campaign.name}"? This cannot be undone.`)) return;
    setSaving(true);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: campaign.id }),
      });
      if (!res.ok) throw new Error("Delete failed");
      onUpdate("delete-campaign", { id: campaign.id });
      toast("Campaign deleted", "success");
    } catch {
      toast("Failed to delete campaign", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive() {
    const updated = { ...draft, is_active: draft.is_active ? 0 : 1 };
    setDraft(updated);
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });
      if (!res.ok) throw new Error("Save failed");
      const data = await res.json();
      onUpdate("update-campaign", data.campaign || data);
    } catch {
      setDraft(draft);
      toast("Failed to toggle active state", "error");
    }
  }

  const charCount = (draft.body_template || "").length;
  const charOverLimit = draft.type === "mailto" && charCount > 1500;

  return (
    <div className="rounded-lg border border-navy-200 bg-white shadow-sm">
      {/* Collapsed header */}
      <div className="flex items-center gap-3 px-5 py-4">
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="flex flex-1 items-center gap-3 text-left"
          aria-expanded={expanded}
        >
          <svg
            className={`h-4 w-4 shrink-0 text-navy-400 transition-transform ${expanded ? "rotate-90" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
          <span className="font-semibold text-navy-900">{campaign.name || "Untitled"}</span>
          <span
            className={`ml-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
              campaign.type === "mailto"
                ? "bg-navy-100 text-navy-700"
                : "bg-amber-100 text-amber-800"
            }`}
          >
            {campaign.type}
          </span>
        </button>

        <button
          type="button"
          onClick={handleToggleActive}
          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
            draft.is_active ? "bg-emerald-500" : "bg-navy-300"
          }`}
          role="switch"
          aria-checked={draft.is_active}
          aria-label={draft.is_active ? "Active — click to deactivate" : "Inactive — click to activate"}
        >
          <span
            className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
              draft.is_active ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="border-t border-navy-100 px-5 py-5 space-y-4">
          {/* Description (read-only summary) */}
          {campaign.description && (
            <p className="text-sm text-navy-600">{campaign.description}</p>
          )}

          {/* Edit form */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-600">
                Campaign Name
              </label>
              <input
                type="text"
                value={draft.name || ""}
                onChange={(e) => handleChange("name", e.target.value)}
                className="w-full rounded-md border border-navy-300 px-3 py-2 text-sm text-navy-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-600">
                Type
              </label>
              <select
                value={draft.type || "mailto"}
                onChange={(e) => handleChange("type", e.target.value)}
                className="w-full rounded-md border border-navy-300 px-3 py-2 text-sm text-navy-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none bg-white"
              >
                <option value="mailto">mailto</option>
                <option value="clipboard">clipboard</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-600">
                Description
              </label>
              <textarea
                value={draft.description || ""}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={2}
                className="w-full rounded-md border border-navy-300 px-3 py-2 text-sm text-navy-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none resize-y"
              />
            </div>

            {draft.type === "mailto" && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-navy-600">
                  Subject Line
                </label>
                <input
                  type="text"
                  value={draft.subject || ""}
                  onChange={(e) => handleChange("subject", e.target.value)}
                  className="w-full rounded-md border border-navy-300 px-3 py-2 text-sm text-navy-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                />
              </div>
            )}

            {draft.type === "clipboard" && (
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs font-semibold text-navy-600">
                  Form URL
                </label>
                <input
                  type="url"
                  value={draft.form_url || ""}
                  onChange={(e) => handleChange("form_url", e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-md border border-navy-300 px-3 py-2 text-sm text-navy-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
                />
              </div>
            )}

            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-navy-600">
                Body Template
              </label>
              <MergeFieldBar textareaRef={bodyRef} />
              <textarea
                ref={bodyRef}
                value={draft.body_template || ""}
                onChange={(e) => handleChange("body_template", e.target.value)}
                rows={8}
                className="w-full rounded-md border border-navy-300 px-3 py-2 text-sm text-navy-900 font-mono focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none resize-y"
              />
              <p
                className={`mt-1 text-xs ${charOverLimit ? "text-red-600 font-semibold" : "text-navy-400"}`}
              >
                {charCount} character{charCount !== 1 ? "s" : ""}
                {draft.type === "mailto" && " / 1500 max for mailto"}
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-navy-600">
                Sort Order
              </label>
              <input
                type="number"
                value={draft.sort_order ?? 0}
                onChange={(e) =>
                  handleChange("sort_order", parseInt(e.target.value, 10) || 0)
                }
                className="w-28 rounded-md border border-navy-300 px-3 py-2 text-sm text-navy-900 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30 focus:outline-none"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="rounded-md bg-navy-700 px-5 py-2 text-sm font-semibold text-white hover:bg-navy-800 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving..." : "Save Campaign"}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-50 transition-colors"
            >
              Delete
            </button>
          </div>

          {/* Recipients section (only for mailto campaigns) */}
          {draft.type === "mailto" && (
            <RecipientsPanel
              campaign={campaign}
              recipients={recipients}
              onUpdate={onUpdate}
              toast={toast}
            />
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main admin dashboard page
// ---------------------------------------------------------------------------
export default function AdminDashboardPage() {
  const router = useRouter();
  const [authed, setAuthed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState([]);
  const [recipients, setRecipients] = useState([]);
  const [toastMsg, setToastMsg] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToastMsg({ message, type, key: Date.now() });
  }, []);

  // Auth check
  useEffect(() => {
    fetch("/api/admin/check")
      .then((res) => {
        if (!res.ok) throw new Error("Not authenticated");
        setAuthed(true);
      })
      .catch(() => {
        router.replace("/admin/login");
      });
  }, [router]);

  // Load data once authed
  useEffect(() => {
    if (!authed) return;
    setLoading(true);
    fetch("/api/admin/campaigns")
      .then((res) => {
        if (!res.ok) throw new Error("Fetch failed");
        return res.json();
      })
      .then((data) => {
        const allCampaigns = data.campaigns || [];
        setCampaigns(allCampaigns);
        const allRecipients = allCampaigns.flatMap(c => (c.recipients || []).map(r => ({ ...r, campaign_id: r.campaign_id ?? c.id })));
        setRecipients(allRecipients);
      })
      .catch(() => {
        showToast("Failed to load campaigns", "error");
      })
      .finally(() => setLoading(false));
  }, [authed, showToast]);

  // Centralized state update handler
  function handleUpdate(action, payload) {
    switch (action) {
      case "update-campaign":
        setCampaigns((prev) =>
          prev.map((c) => (c.id === payload.id ? payload : c)),
        );
        break;
      case "delete-campaign":
        setCampaigns((prev) => prev.filter((c) => c.id !== payload.id));
        setRecipients((prev) =>
          prev.filter((r) => r.campaign_id !== payload.id),
        );
        break;
      case "add-campaign":
        setCampaigns((prev) => [...prev, payload]);
        break;
      case "update-recipient":
        setRecipients((prev) =>
          prev.map((r) => (r.id === payload.id ? payload : r)),
        );
        break;
      case "add-recipient":
        setRecipients((prev) => [...prev, payload]);
        break;
      case "delete-recipient":
        setRecipients((prev) => prev.filter((r) => r.id !== payload.id));
        break;
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  async function handleNewCampaign() {
    try {
      const res = await fetch("/api/admin/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: "New Campaign",
          type: "mailto",
          description: "",
          subject: "",
          body_template: "",
          is_active: 0,
          sort_order: campaigns.length,
        }),
      });
      if (!res.ok) throw new Error("Create failed");
      const data = await res.json();
      handleUpdate("add-campaign", data.campaign || data);
      showToast("Campaign created", "success");
    } catch {
      showToast("Failed to create campaign", "error");
    }
  }

  if (!authed) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm text-navy-500">Checking authentication...</p>
      </div>
    );
  }

  return (
    <>
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-navy-900">Admin Dashboard</h1>
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-navy-300 px-4 py-2 text-sm font-medium text-navy-600 hover:bg-navy-100 transition-colors"
        >
          Logout
        </button>
      </header>

      {/* Toolbar */}
      <div className="mb-6">
        <button
          type="button"
          onClick={handleNewCampaign}
          className="rounded-md bg-amber-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-700 transition-colors"
        >
          + New Campaign
        </button>
      </div>

      {/* Campaign list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm text-navy-500">Loading campaigns...</p>
        </div>
      ) : campaigns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-navy-300 py-16 text-center">
          <p className="text-navy-500">No campaigns yet. Create one to get started.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {campaigns
            .slice()
            .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
            .map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                recipients={recipients}
                onUpdate={handleUpdate}
                toast={showToast}
              />
            ))}
        </div>
      )}

      {/* Toast */}
      {toastMsg && (
        <Toast
          key={toastMsg.key}
          message={toastMsg.message}
          type={toastMsg.type}
          onDismiss={() => setToastMsg(null)}
        />
      )}
    </>
  );
}
