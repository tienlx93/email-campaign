---
screen: Login
route: /login
auth: public (redirect to /campaigns if already authenticated)
---

# Login Screen Spec

## Purpose

Allows an existing user to authenticate. On success, stores the JWT in localStorage and redirects to the campaigns list.

---

## Layout

Single centered card, vertically centered on the full viewport. The card contains a title ("Sign in"), the form fields, and a submit button. Below the button, a line of muted text reads "Don't have an account?" followed by a link "Register" that navigates to /register.

---

## Components

### LoginPage (page component)

- Owns form state via React Hook Form
- Dispatches the RTK Query `login` mutation on submit
- On success: dispatches `setCredentials` to the auth slice, then navigates to `/campaigns`
- On error: surfaces the error message inline (see Error States below)

### LoginForm

- Rendered inside `LoginPage`
- Contains two fields: email and password
- Contains the submit button

### EmailField

- Label: "Email"
- Input type: email
- Placeholder: "you@example.com"
- Validation message shown below the field (see Validation section)

### PasswordField

- Label: "Password"
- Input type: password
- No placeholder
- Validation message shown below the field

### SubmitButton

- Label: "Sign in"
- Shows a loading spinner and is disabled while the mutation is in-flight
- Re-enables once the mutation settles (success or error)

---

## Validation Rules (client-side, before submit)

All validation runs via React Hook Form with a Zod resolver.

| Field    | Rule                              | Error message shown to user         |
|----------|-----------------------------------|--------------------------------------|
| email    | Required; must be valid email format | "Please enter a valid email address" |
| password | Required; must be non-empty       | "Password is required"               |

Validation fires on submit. Individual field errors clear as soon as the field passes validation on change.

---

## API Call

- Endpoint: POST /auth/login
- Request body: email (string), password (string)
- On HTTP 200: store token and user object from response in the Redux auth slice; navigate to /campaigns
- On HTTP 401: display the error message "Invalid email or password" below the form (not per-field)
- On HTTP 400: display "Please check your input and try again" below the form
- On network error: display "Something went wrong. Please try again."

---

## Success State

After a successful login, the user is immediately redirected to /campaigns. No success message is shown on the login page itself.

---

## Error States

A single error banner is shown directly above the submit button when an API error occurs. It is a destructive-variant alert that shows the message text. It disappears when the user modifies any field.

---

## Loading State

While the mutation is in-flight, the submit button shows a spinner icon to the left of the label "Sign in" and the button is disabled. No other UI changes occur.

---

## Redirect Logic

- If a valid token already exists in the Redux store when the page mounts, immediately redirect to /campaigns without rendering the form.
- After a successful login, navigate to /campaigns using the React Router navigate function.
