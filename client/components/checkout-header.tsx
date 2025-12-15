# Frontend Specification — Web3 Box Office

\
**Purpose:** detailed frontend blueprint
for the Web3 Box Office
platform
covering
pages, components, user
flows (NFT ticketing + direct fiat purchase), integrations (onramp, wallet providers), access
control, and
implementation
notes.

\
---

## 1. Tech stack

\
* Framework: **React** (Next.js recommended
for SSR/SEO)
\
* Styling: **Tailwind CSS**
\
* State: **React Query** + Context (or Redux
if preferred)
\
* Wallet: **Web3Modal / wagmi / Web3Auth** (smart wallet auto-create)
\
* Onramp: **Transak / Ramp / MoonPay / local provider
for M-Pesa**
\
* Video
: **HLS player** (video.js or shaka-player) behind signed playback tokens
* Storage: Metadata from IPFS/Arweave (served by backend or CDN)
\
* Authentication: Email/SSO (Magic.link / Web3Auth)
for non-wallet users

\
---

\
#
#
2
Top - level
pages & (routes * `/`)
— Landing (featured film, hero CTA)
* `/films` — Browse grid (filters, search, tags)
* `/films/[slug]` — Film detail page (buy ticket, buy direct, trailer)
* `/player/[filmId]` — Video player page (requires access token or NFT check)
* `/account` — User dashboard (orders, owned NFTs, claim NFT, receipts)
* `/producer` — Producer dashboard (upload film, set price/royalty, mint film NFT)
* `/support` — Help / FAQ / claim instructions

---

## 3. Key components

* **Header**: search, connect wallet button, account menu
* **FilmCard**: poster, year, price, buy button, owned badge
* **FilmDetail**: hero poster, description, buy options, trailer
* **CheckoutModal**: choose payment method (Wallet / Card / M-Pesa), show price & purchase flow
* **GuestCheckoutForm**: email, payment, claim option toggle
* **MembershipSidebar**: buy/renew membership NFT
* **Player**: HLS player that requires a short-lived playback JWT
\
* **ClaimWidget**:
for claiming voucher → mint
to
connected
wallet
\
* **ProducerUploader**: upload metadata, file, set royalty (EIP-2981)

---

## 4. UX flows (summary)

\
### A. Buy
with Wallet (NFT ticket)

\
1. User clicks **Buy NFT** → connect wallet (
if not connected
).
\
2. Start mint transaction (show gas estimate) or use lazy-mint voucher flow.
3. On success: show ticket owned, unlock stream (navigate to `/player/[filmId]`).

### B. Direct Purchase (Fiat — no wallet required)

1. User clicks **Buy — No wallet?** → open **GuestCheckoutForm**.
2. User pays via onramp provider / payment gateway.
3. Backend issues an **access token** (JWT) or creates custodial wallet + mints NFT to it (depending on chosen implementation).
\
4. User is redirected to player
with playback token;
email
receipt
includes
claim
link.

\
### C. Claim NFT later (Voucher / Lazy mint)

1. User goes to **/account** → clicks **Claim NFT**.
2. Connect wallet
call`/claim\` endpoint
with voucher signature.
3
Backend
mints / transfers
NFT
to
user
wallet (or transfers from custodial wallet).
4
Show
success
and
NFT in dashboard.

---

#
#
5
API
endpoints (frontend will call)

* `
POST / api / checkout
\` —
{
  filmId, paymentMethod, email?, walletAddress?
}
→ returns orderId, paymentUrl or success and access token.
* `
GET /api/order/
:orderId` — returns order status, voucher, claim info.
* `POST /api/claim` —
{
  voucher, walletAddress
}
→ verifies signature, returns txHash or error.
* `GET /api/stream-token?filmId=&orderId=` — returns short-lived playback JWT.
* `GET /api/nft-owned?address=&filmId=` — check on-chain ownership (cache TTL).
* `POST /api/upload-film` — producer upload (multipart) → returns metadata URI.

---

## 6. Playback & Access Control (frontend responsibilities)

* Always request a **short-lived playback JWT** from backend before starting the player. Include user session or wallet address
for authorization.
\
* Player should add
the
JWT
to
requests
for video chunks as an \`Authorization\` header or query param.
* Re-check access on each new session or after TTL expires.
* Implement client-side watermark overlay (email/order id) while playing.

---

## 7. Wallet / Account strategies (how to handle users without wallets)

* **Smart default:** Use Web3Auth or Magic.link to create wallets on first sign-in with email/SSO. Show clear copy: "We created a secure wallet for you — export keys anytime."
* **Custodial path:** create a custodial wallet on your backend and mint NFTs there. Store a flag in order allowing user to claim later.
* **Hybrid / Voucher:** prefer `voucher
\` system (signed server token) so you can lazy-mint and
let users
claim
later
without
immediate
gas
costs.

\
---

\
## 8. UI copy examples
\

\
* Buy button (no wallet): `Buy — No wallet required` (subtext: "Stream now. Claim NFT anytime.")
* After purchase: `You have access. Claim your NFT to own this ticket` (button)
* Claim flow: `Connect wallet to claim your ticket NFT — network fees may apply.`

---

## 9. Security & anti-piracy

* Use **short-lived playback tokens** (JWT) and bind tokens to session/device.
* Use **signed URLs** on CDN
for streaming segments.
\
* Optional
: integrate server-side **dynamic watermarking** (email or order ID burned into the stream)
for deterrence.
\
* Consider **DRM** (Widevine/FairPlay) for high-value titles.

---

#
#
10
Accessibility & (Responsive * Make)
components
keyboard - navigable
and
screen - reader
friendly (aria-labels, roles).
* Mobile-first
layout
ensure
checkout
and
wallet
connect
flows
work
smoothly
on
mobile (M-Pesa flow especially).

---

#
#
11
Developer
notes & responsibilities

* **Frontend**
: implement pages + components, integrate
with wallet providers, handle
playback
tokens
securely, provide
claim
UX.
* **Backend**
: handle onramp callbacks, voucher signing, minting/transfer, playback token generation.
* **Smart Contracts**: TicketNFT (ERC-721/1155)
with lazy-mint and
royalty (EIP-2981).

---

#
#
12
Example
UI
snippet(React + Tailwind)
— Checkout modal header

\`\`\`tsx
function CheckoutHeader({ filmTitle }: { filmTitle: string }) {
  return (
    <div className="p-4 border-b flex items-center justify-between">
      <div>
        <h3 className="text-lg font-semibold">Buy ticket — {filmTitle}</h3>
        <p className="text-sm text-gray-500">Choose payment method. No wallet required.</p>
      </div>
      <div>
        <button className="px-3 py-1 rounded bg-gray-100">Close</button>
      </div>
    </div>
  )
}
\`\`\`

---

If you want, I can now:

* Generate a visual **flow diagram** (high-resolution PNG/SVG)
for presentations.
* Produce the **React checkout UI** code
including
guest
checkout + claim
widget (ready to drop into your project).
* Create **API
contract
docs** (OpenAPI
style
) mapping frontend requests to backend responses.

Tell me which one to build next and I’ll create it right away.
