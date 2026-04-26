# Firebase Security Specification

## Data Invariants
- A user document can only be created by the authenticated owner.
- A user can only read and write their own user document.
- The `uid` and `email` fields are immutable after creation.
- The `createdAt` field must match the server timestamp on creation.
- The `updatedAt` field must match the server timestamp on update.

## The "Dirty Dozen" Payloads (Denial Tests)

1. **Identity Spoofing**: An attacker tries to create a user document with a `uid` that doesn't match their `auth.uid`.
2. **PII Breach**: An unauthenticated user tries to read the `users` collection.
3. **Data Poisoning**: Trying to set `name` to a 5MB string.
4. **Timestamp Fraud (Create)**: Trying to set `createdAt` to a date in the past.
5. **Timestamp Fraud (Update)**: Trying to set `updatedAt` to a date in the future.
6. **Immutable Field Tampering**: Trying to change the `email` of an existing user.
7. **Privilege Escalation**: Attempting to add an `isAdmin` field to a user document.
8. **Shadow Field Injection**: Adding an undocumented `role: "admin"` field.
9. **Relational Break**: Deleting a user document that should exist for audit.
10. **Resource Exhaustion**: Sending a payload with 1000 keys.
11. **Malicious ID**: Creating a user with a `userId` containing malicious shell characters.
12. **Cross-User Write**: Authenticated user A trying to update user B's profile.

## Test Runner (firestore.rules.test.ts)
(Implementation of these tests in a separate file if needed, but summary here for now).
All above payloads must return `PERMISSION_DENIED`.
