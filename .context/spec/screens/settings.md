---
screen: User Settings
route: /settings
auth: required (redirect to /login if no valid token)
---

# User Settings Page Spec

## Purpose

Allows authenticated users to manage their profile information and change their password.

---

## Layout

Full-width page under AdminLayout with constrained-width content area (max-width 640px, centered). Content is scrollable below the fixed top bar.

### Page Header

- Page title: "User Settings" (bold, prominent)

---

## Card 1 — Profile Information

### Header Row

Displays a static summary of the user's current identity:

- Avatar (44px circle, 2-letter initials from user name, background color deterministically hashed from name)
- Display name (bold text)
- Email (normal weight, below or beside the name)

### Form Section

**Display Name Input**

- Label: "Display Name"
- Text input field (editable)
- Placeholder: "Your name"
- Pre-filled with current user.name from Redux auth slice
- Validation: required, 1–100 characters

**Email Input**

- Label: "Email"
- Text input field (read-only, not-allowed cursor on hover)
- Pre-filled with current user.email from Redux auth slice
- Visually muted (lower opacity or grey text) to indicate read-only status
- No editing allowed

### Submit Button

- Label: "Save Name"
- Variant: primary
- Disabled while request is in flight
- Loading state: show spinner or loading text

### Success/Error Handling

**On Success:**

- Dispatch updateUser action to auth slice with the new user object (id, email, name)
- Show success toast: "Profile updated successfully"
- Top bar avatar and name update immediately (since it reads from auth.user)

**On Error:**

- Show error toast with the backend error message

### Request Details

- Endpoint: PATCH /auth/profile
- Requires auth (Bearer token)
- Request body: { name: string }
- Response: { id: string, email: string, name: string }

---

## Card 2 — Change Password

### Form Section

Three password input fields (all required):

**Current Password**

- Label: "Current Password"
- Type: password (masked input)
- Placeholder: "Enter your current password"

**New Password**

- Label: "New Password"
- Type: password (masked input)
- Placeholder: "At least 8 characters"
- Minimum 8 characters (enforced server-side and validated client-side)
- Hint text: "Min 8 characters"

**Confirm New Password**

- Label: "Confirm New Password"
- Type: password (masked input)
- Placeholder: "Confirm your new password"

### Client-Side Validation

Before submit, validate:

- All three fields are non-empty
- newPassword and confirmPassword must match exactly

If validation fails, prevent submit and show inline error message: "New passwords do not match."

### Submit Button

- Label: "Update Password"
- Variant: primary
- Disabled while request is in flight
- Disabled while client-side validation fails (password mismatch)
- Loading state: show spinner or loading text

### Success/Error Handling

**On Success:**

- Show success toast: "Password updated successfully"
- Clear all form fields
- Focus on Current Password field

**On Wrong Current Password (401):**

- Show error toast with backend message (e.g. "Current password is incorrect")

**On Other Error:**

- Show error toast with backend error message

### Request Details

- Endpoint: PATCH /auth/password
- Requires auth (Bearer token)
- Request body: { currentPassword: string, newPassword: string }
- Response: 200 OK with empty body on success, 401 Unauthorized if currentPassword is wrong

### Server-Side Validation

- currentPassword: required, must match the bcrypt hash stored in the database; returns 401 if wrong
- newPassword: required, minimum 8 characters

---

## Card Spacing and Styling

- Both cards are stacked vertically with consistent spacing between them
- Each card has a subtle border and light background
- Form labels are bold and consistently styled
- Input fields have consistent padding and focus states
- Buttons are full-width or aligned left with consistent sizing

---

## Data Dependencies

The page reads from Redux:

- auth.user.name — pre-fills Display Name field
- auth.user.email — pre-fills Email field (read-only)
- auth.user (for avatar display in header row)

---

## Notes

- No external API calls besides the two PATCH endpoints
- Password fields clear on successful update (security best practice)
- Avatar color matches the avatar in the top bar (deterministic hash from user.name)
- The page is protected by RequireAuth and will redirect to /login if user is not authenticated
