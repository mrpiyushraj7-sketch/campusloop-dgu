# CampusLoop Firestore Security Specification

## 1. Core Data Invariants
1. **Strict RBAC & Zero Self-Promotion**: Students can only create `/users/{uid}` with `role: 'student'` and `uid == request.auth.uid`. Updating `role`, `uid`, `email`, or `createdAt` is blocked for non-admins.
2. **PII Isolation**: `/users/{uid}` contains student email and studentId; reads (`get` and `list`) are strictly restricted to the document owner or verified admin.
3. **Catalog Integrity**: Public discovery collections (`businesses`, `offers`, `services`, `events`) can only be created, modified, or deleted by verified admins. List queries strictly enforce `resource.data.status == 'active'` for non-admin students.
4. **Relational Existence**: Creating a `booking` requires `services/{serviceId}` to exist; creating an `eventRegistration` requires `events/{eventId}` to exist; creating a `redemption` requires `offers/{offerId}` to exist.
5. **Terminal State Locking**: Once a `booking` reaches `Completed` or `Cancelled`, an `eventRegistration` reaches `Cancelled`, a `redemption` reaches `Used` or `Expired`, or a `partnerApplication` reaches `Approved` or `Rejected`, non-admin users cannot mutate it.
6. **Temporal & Key Integrity**: Every write verifies `request.time` for `createdAt`/`updatedAt`, strict `hasAll`/`hasOnly` key allowlists on create, `affectedKeys().hasOnly(...)` on action-based updates, and `.size()` bounds on every string.

## 2. Adversarial "Dirty Dozen" Payloads (Must Return PERMISSION_DENIED)
1. **Self-Admin Escalation on Signup**: `POST /users/{uid}` with `{ role: "admin", ... }` as a normal student.
2. **Role Mutation on Profile Update**: `PATCH /users/{uid}` changing `{ role: "admin" }`.
3. **Ghost Shadow Field Injection**: `POST /users/{uid}` adding `{ isVerifiedPartner: true }` outside `hasOnly`.
4. **Cross-User PII Read**: `GET /users/{otherUid}` as student A.
5. **Unverified Admin Email Spoof**: Request with admin email token where `email_verified == false`.
6. **Student Creating Public Business**: `POST /businesses/{id}` by a non-admin student.
7. **Orphaned Booking Creation**: `POST /bookings/{id}` pointing to nonexistent `serviceId: "fake-service-999"`.
8. **Booking State Shortcutting**: Student creating a booking directly with `status: "Confirmed"` or `"Completed"`.
9. **Terminal State Re-Opening**: Student updating a `Cancelled` booking back to `Pending`.
10. **Identity Spoofing on Redemption**: Student A creating `/redemptions/{id}` with `userId: "studentB"`.
11. **ID Poisoning**: Creating `/favorites/{200-char-junk-id}` or ID containing spaces/slashes.
12. **Client Timestamp Forgery**: Creating a booking with backdated `createdAt` instead of `serverTimestamp()` (`request.time`).
