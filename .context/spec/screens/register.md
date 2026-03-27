---
screen: Register
route: /register
auth: public (redirect to /campaigns if already authenticated)
---

# Register Screen Spec

## Purpose

Allows a new user to create an account. On success, stores the JWT in localStorage (same as login) and redirects to the campaigns list.

---

## Layout

Identical card layout to the Login screen — single centered card, vertically centered on the full viewport. The card contains a title ("Create an account"), the form fields, and a submit button. Below the button, a link reads "Already have an account? Sign in" that navigates to /login.

---

## Components

### RegisterPage (page component)

- Owns form state via React Hook Form with a Zod resolver
- Dispatches the RTK Query `register` mutation on submit
- On success: dispatches `setCredentials` to the auth slice (token + user from response), then navigates to /campaigns
- On error: surfaces the error message inline (see Error States below)

### RegisterForm

- Rendered inside `RegisterPage`
- Contains three fields: name, email, password
- Contains the submit button

### NameField

- Label: "Name"
- Input type: text
- Placeholder: "Alice Smith"
- Validation message shown below the field

### EmailField

- Label: "Email"
- Input type: email
- Placeholder: "you@example.com"
- Validation message shown below the field

### PasswordField

- Label: "Password"
- Input type: password
- Helper text below the input: "At least 8 characters"
- Validation message replaces helper text when there is an error

### SubmitButton

- Label: "Create account"
- Shows a loading spinner and is disabled while the mutation is in-flight
- Re-enables once the mutation settles

---

## Validation Rules (client-side, before submit)

All validation runs via React Hook Form with a Zod resolver.

| Field    | Rule                                  | Error message shown to user               |
|----------|---------------------------------------|-------------------------------------------|
| name     | Required; non-empty; max 255 chars    | "Name is required" / "Max 255 characters" |
| email    | Required; must be valid email format  | "Please enter a valid email address"      |
| password | Required; minimum 8 characters        | "Password must be at least 8 characters"  |

Validation fires on submit. Individual field errors clear as soon as the field passes validation on change.

---

## API Call

- Endpoint: POST /auth/register
- Request body: name (string), email (string), password (string)
- On HTTP 201: store token and user object from response in the Redux auth slice; navigate to /campaigns
- On HTTP 409: display "An account with this email already exists" below the form (not per-field)
- On HTTP 400: display the validation error message from the API response below the form
- On network error: display "Something went wrong. Please try again."

---

## Error States

A single error banner is shown directly above the submit button when an API error occurs. It uses a destructive-variant alert and shows the message text. It disappears when the user modifies any field.

---

## Loading State

While the mutation is in-flight, the submit button shows a spinner icon to the left of "Create account" and is disabled. No other UI changes occur.

---

## Redirect Logic

- If a valid token already exists in the Redux store when the page mounts, immediately redirect to /campaigns without rendering the form.
- After a successful registration, navigate to /campaigns using the React Router navigate function.

---

## Link to Login

Below the submit button, a line of muted text reads "Already have an account?" followed by a link "Sign in" that navigates to /login. This mirrors the "Don't have an account? Register" link on the Login screen.
