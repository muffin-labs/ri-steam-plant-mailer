# TODO — Resident Mailer

## Phase 1: MVP (Get It Live)

### Setup
- [ ] Create GitHub repo under muffin-labs org
- [ ] Enable GitHub Pages (or set up Vercel/Netlify)
- [ ] Set up custom domain if available (e.g. mail.archrica.org)

### Core App
- [ ] Single-page HTML/CSS/JS app
- [ ] Resident input form:
  - Name (first, last)
  - Address (street address on Roosevelt Island)
  - Email address (optional — used for "email me a copy" feature, not stored)
- [ ] Campaign selector (tabs or dropdown)
- [ ] Recipient checkboxes for each campaign (all selected by default)
- [ ] "Send Email" button that generates a `mailto:` link and triggers it
- [ ] "Copy to Clipboard" fallback button for long messages or when mailto fails
- [ ] Letter preview panel showing the composed message before sending

### Letter Templates
- [ ] Write letter template for each campaign:
  - [ ] Halt the Demolition (HPD, DOB, Mayor, Speaker)
  - [ ] Congressional Inquiry (Nadler, Senators)
  - [ ] State Legislators (Krueger, Serrano, Seawright)
  - [ ] Borough President (Hoylman-Sigal)
  - [ ] City Council Oversight (Speaker Menin)
  - [ ] Comptroller Investigation (Comptroller Levine)
- [ ] Each template should include merge fields: `{{first_name}}`, `{{last_name}}`, `{{address}}`
- [ ] Keep each letter under 1500 characters (mailto URL limit safety)
- [ ] Include key facts: 37-0 CB8 vote, 1000+ petition, 40K SF asbestos, no structural report, "facilitating potential redevelopment" quote

### Recipient Data
- [ ] Compile recipient list with email addresses from NEXT_STEPS.md contacts:
  - HPD Commissioner Dina Levy — commissioner@hpd.nyc.gov
  - DOB Commissioner Ahmed Tigani — commissioner@buildings.nyc.gov
  - Speaker Julie Menin — SpeakerMenin@council.nyc.gov
  - Sen. Krueger staff — tannen@nysenate.gov
  - AM Seawright — SeawrightR@nyassembly.gov
  - Comptroller Levine — nyccbam@comptroller.nyc.gov
  - [ ] Research and add: Rep. Nadler, Sen. Serrano, BP Hoylman-Sigal, Mayor's office
- [ ] Group recipients by campaign

### Design
- [ ] Mobile-first responsive layout
- [ ] Clear, simple UI — the goal is zero confusion
- [ ] Large tap targets for mobile
- [ ] Progress indicator: "Fill in your info → Pick recipients → Send"
- [ ] Success state after mailto fires ("Check your email app — your message should be ready to send!")

## Phase 2: Polish

### UX Improvements
- [ ] Auto-detect if mailto worked (heuristic: page blur event after click)
- [ ] If mailto didn't fire, show clipboard fallback with instructions
- [ ] "Send to All" button that opens one mailto per campaign (batch mode)
- [ ] Remember resident name/address in localStorage (opt-in) so returning visitors don't re-enter
- [ ] Add webmail fallback links (open Gmail compose, Outlook compose) for users whose mailto handler isn't configured
  - Gmail: `https://mail.google.com/mail/?view=cm&to=...&su=...&body=...`
  - Outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=...&subject=...&body=...`

### Content
- [ ] Add a "Why This Matters" section above the form with 3-4 bullet points
- [ ] Add a counter showing how many letters have been sent (requires minimal backend or use a free counter service)
- [ ] Link to archrica.org and the petition
- [ ] Add social share buttons (Twitter/X, Facebook) after sending

### Accessibility
- [ ] ARIA labels on all form elements
- [ ] Keyboard navigation
- [ ] Screen reader testing
- [ ] High contrast mode support
- [ ] Test with VoiceOver (iOS) and TalkBack (Android)

## Phase 3: Extras

### Additional Campaigns
- [ ] Add new letter templates as the legal case develops
- [ ] Template for responding to specific events (e.g., if a hearing is scheduled)
- [ ] "Custom letter" mode where resident can edit the template before sending

### Analytics (Privacy-Respecting)
- [ ] Consider privacy-respecting analytics (Plausible, Fathom) to track page visits only
- [ ] No PII, no cookies, no tracking scripts
- [ ] Count of "Send" button clicks (client-side counter, no server)

### Integration
- [ ] Embed widget version for archrica.org
- [ ] QR code for printed flyers linking directly to the mailer
- [ ] Open Graph / social preview cards for link sharing

## Technical Notes

### mailto URL Format
```
mailto:recipient1@example.com,recipient2@example.com?subject=Subject%20Here&body=Body%20text%20here%20with%20%0A%20line%20breaks
```

### Character Limits
- **iOS Safari:** ~2000 chars total URL
- **Android Chrome:** ~2000 chars
- **Desktop browsers:** generally ~8000 chars but varies
- **Safe target:** keep subject + body under 1800 chars encoded

### Gmail Compose Fallback
```
https://mail.google.com/mail/?view=cm&to=recipient@example.com&su=Subject&body=Body
```

### Outlook Compose Fallback
```
https://outlook.live.com/mail/0/deeplink/compose?to=recipient@example.com&subject=Subject&body=Body
```
