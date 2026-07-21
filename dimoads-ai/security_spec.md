# Dimoads AI Security Specifications

This specification outlines the data invariants and access controls designed to secure the global classifieds marketplace.

## 1. Core Data Invariants

### Users Collection (`/users/{userId}`)
- **Owner Isolation**: Users can only write to their own profile document (`request.auth.uid == userId`).
- **RBAC Self-Promotion Prevention**: Users cannot modify administrative fields like `role` or `verificationStatus` or `trustScore`. These are restricted strictly to system-assigned fields.
- **PII Isolation**: Complete read access is granted only to the user themselves (`request.auth.uid == userId`) or an admin. Public details (like display name, and avatar/verification badges) are exported into a subcollection or strictly filtered if read.

### Listings Collection (`/listings/{listingId}`)
- **Identity Matching**: The `ownerId` of the listing must match the authenticated user's UID on creation (`incoming().ownerId == request.auth.uid`).
- **Immutable Fields**: Once created, `ownerId` and `createdAt` cannot be modified.
- **Status Progression**: Users cannot un-suspend their own listings if flagged by admins. Only admins can transition from `suspended` back to `active`.
- **Size Bounds**: String fields are strictly constrained (`title.size() <= 100`, `description.size() <= 2000`) to prevent Denial of Wallet storage attacks.

### Chats Collection (`/chats/{chatId}/messages/{messageId}`)
- **Participant Access**: Access to messages is strictly restricted to authenticated users whose UIDs correspond to either the sender or receiver in the parent chat definition.
- **Immutability**: Sent messages are immutable (preventing editing chat histories unilaterally).

---

## 2. The "Dirty Dozen" Security Violations (TDD Test Suite)

Here are the 12 adversarial payloads designed to break our security systems, and which must be rejected with `PERMISSION_DENIED` by our Firestore rules:

1. **Self-Verification Attack (Identity Spoofing)**: A user tries to create/update their profile with `verificationStatus: "verified"`.
2. **Trust Score Boosting (Privilege Escalation)**: A regular user updates their own profile to increase `trustScore` to `100`.
3. **Listing Impersonation**: User `A` publishes a listing setting `ownerId: "B"`.
4. **Retroactive Listing Theft**: User `B` updates an existing listing owned by User `A` to set `ownerId: "B"`.
5. **Junk Listing Denial of Wallet**: An attacker posts a listing with a title size of 150,000 characters and price of `-99.00` USD.
6. **Self-Admin Elevating**: A user attempts to create a document in the `/admins/` collection or modify their own role.
7. **Ad-hoc Listing Re-activation**: A user updates a listing that was `suspended` by an admin back to `active`.
8. **Eavesdropping on Private Chat**: User `C` queries `/chats/chat-A-B/messages` to read messages between users `A` and `B`.
9. **Faking Message Author**: User `A` sends a message in a chat but sets `senderId: "B"`.
10. **Listing Expiry Date Warp**: A user sets `createdAt` or `expiryDate` to a date in the past, or sets `createdAt` to a client-controlled timestamp instead of `request.time`.
11. **Blanket Query Scraping**: A client initiates a listing read query without limiting their scope or bypassing ownership checks on user PII.
12. **Ghost Moderation Dismissal**: A user writes directly to `/reports/{reportId}` to dismiss a moderation ticket filed against their own listing.

---

## 3. Threat Matrix & Validation Actions

| Threat Model | Attack Vector | Security Rule Countermeasure |
| :--- | :--- | :--- |
| **Identity Spoofing** | Setting client-side `ownerId` on listings or messages | Assert `incoming().ownerId == request.auth.uid` |
| **Privilege Escalation** | Self-assigning `trustScore` or admin status | Separate `isAdmin()` logic utilizing exists in `/admins` collection; block writes on `trustScore` and `verificationStatus` |
| **Resource Poisoning** | Massive string payloads or negative pricing | Enforce `.size()` constraints on strings, array items, and positive-only check on `price` |
| **State Shortcutting** | Resurrecting suspended listings | Validate `!(existing().status == "suspended")` unless `isAdmin()` is true |
| **PII Data Leak** | Blanket list reads on `/users` | Restrict read access of complete user documents containing email and phone strictly to the owner |
