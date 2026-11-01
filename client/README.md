# Gather & Bloom Client Guide

This folder contains the React frontend for the Gather & Bloom event styling website. It serves the public website, account creation and sign-in dialogs, the customer account dashboard, and the administrator workspace. The frontend is built with React and Vite and communicates with the Express API in the sibling `server` folder.

## Contents

```text
client/
├── index.html                 # HTML document loaded by the browser
├── package.json               # Client dependencies and commands
└── src/
    ├── main.jsx               # React entry point
    ├── App.jsx                # Site state, pages, forms, and dashboards
    ├── styles.css             # Main site, dialogs, and dashboard styles
    ├── public.css             # Public gallery and service section styles
    ├── components/
    │   ├── Navbar.jsx         # Shared site header and account controls
    │   └── Footer.jsx         # Shared public site footer
    └── lib/
        └── api.js             # HTTP requests to the backend
```

`node_modules/` and `dist/` are generated folders. `node_modules/` contains installed packages. `dist/` is created by the production build and contains files served by the production server. Do not edit these generated files directly.

## Requirements and commands

Use a supported Node.js installation and install the dependencies from this directory:

```powershell
cd client
npm install
```

The website needs both MongoDB and the Express API to load database content. Make sure MongoDB is running and `server/.env` has the database connection and required server settings. Start the API in one terminal:

```powershell
cd ..\server
npm install
npm start
```

In a second terminal, start the Vite development server:

```powershell
cd client
npm start
```

This opens Vite at its default local address, usually `http://localhost:5173`. To use a custom address and port instead:

```powershell
npm run dev -- --host 127.0.0.1 --port 3001
```

Open the local address Vite prints, for example `http://127.0.0.1:3001`. Vite forwards `/api` requests to the Express API at `http://127.0.0.1:5000`. If the API starts after the page, the catalog automatically retries while it is unavailable.

Create a production frontend build:

```powershell
npm run build
```

Vite writes the finished website to `client/dist`. To serve that output locally with Vite, run `npm run preview` after building. The Express server is also configured to serve `client/dist` when deployed or started in production mode.

The available scripts are `start` and `dev` (development server), `build` (production compilation), and `preview` (serve a previously built frontend). The package includes React, React DOM, React Router DOM, Vite, and the React Vite plugin. The current page flow is managed in `App.jsx`; React Router DOM is installed but is not currently used to define routes.

## How React starts

`index.html` contains the page metadata, the `<div id="root">` mounting point, and a module reference to `/src/main.jsx`. `main.jsx` imports React, `createRoot`, `App`, and the main stylesheet, then mounts the app:

```jsx
createRoot(document.getElementById('root')).render(
  <React.StrictMode><App /></React.StrictMode>
);
```

`React.StrictMode` helps identify unsafe patterns during development. In development it can cause effects to run more than once to expose side effects; API reads should therefore be safe to repeat. The application uses JSX, function components, React hooks, props, and browser APIs such as `localStorage` and `fetch`.

## Main application: `src/App.jsx`

`App.jsx` contains the app's shared state, page copy defaults, reusable UI components, public page sections, and both account workspaces. The main component chooses which view to render based on the signed-in user's role and the current view state.

### Default website copy

`defaultSiteContent` defines fallback text for the brand, navigation, hero section, studio story, collection, gallery, services, enquiry form, contact form, and footer. When the backend returns saved site content, it is merged over these defaults. Missing content fields therefore continue to show a usable fallback.

`pageContentFields` describes the fields shown by the administrator's page-content editor. Each group contains a section title and field definitions. The editor uses those definitions to render the form without hard-coding a separate input for every site setting.

### App state and data flow

The `App` component keeps the following key values in React state:

- `siteContent`: copy and media settings loaded from the API, merged with defaults.
- `categories` and `decorations`: public collection data used by the website and customer dashboard.
- `mediaItems`: published gallery media.
- `category`: the selected public collection filter.
- `catalogState`: whether public content is loading, ready, or unavailable.
- `user` and `token`: authenticated account data and the bearer token.
- `authOpen` and `authMode`: whether the sign-in/create-account dialog is open and which mode it displays.
- `adminVisible` and `customerVisible`: whether an authenticated person is looking at their workspace or the public site.
- `notice` and `sending`: transient feedback and form submission state.

On first render, `loadCatalog` requests categories, decorations, site content, and gallery media together. The `api` helper performs those requests. If any request fails, the app marks the catalog unavailable and shows an error notice. When a stored token exists, the app requests `/auth/me` to validate it and restore the user session. Invalid or expired tokens are removed from local storage.

Successful sign-in or registration calls `finishAuth`. It stores the returned token under `gather-token`, sets the user, closes the dialog, and opens the workspace that matches the returned role. Signing out clears the saved token and resets the view to the public website.

### Public website

When a workspace is not open, `App` renders the public page. It includes the hero, studio story, category and decoration collection, latest work gallery, services, and footer. The collection can filter decorations by category. Public pages are for viewing the business content, catalog, images, and videos; order and direct contact forms appear only in the signed-in customer dashboard.

### Customer account dashboard

`CustomerWorkspace` displays public collection data alongside account features. The signed-in header links to the collection, order form, messages, and request history. Customers can:

- Browse decorations and their categories and prices.
- Send an event request with occasion, date, location, phone, budget, and event details.
- See the status and details of their own requests in order history.
- Send a private message to the studio and read replies saved by the administrator.

On mount, the dashboard loads `/customer/service-requests` and `/customer/messages` with the customer's bearer token. Submitting either form refreshes the account data after the server accepts it. The dashboard does not expose another customer's records; the server filters these routes by the authenticated user.

### Administrator workspace

`AdminWorkspace` provides the studio administration tabs. It loads categories, decorations, service requests, and messages. Depending on the selected tab, administrators can review the overview, edit page content, manage media, create or edit categories and decorations, update enquiry statuses, and reply to customer messages.

Mutations go through the shared API helper with the administrator token. After a successful change, the workspace reloads the relevant data and displays a notice. Uploads use `uploadFile` because image/video bodies are sent as raw file data rather than JSON.

### Upload media and publish it publicly

1. Sign in with an administrator account and open **Studio dashboard**.
2. Select the **Media library** tab.
3. Choose **Upload image or video** and select one or several supported files in the file picker. Supported formats are JPEG, PNG, WebP, GIF, MP4, WebM, OGG, and MOV. Each file can be up to 80 MB. The selected files upload one at a time and progress is shown on the button.
4. The new files are saved to the media library but are private by default. Select **Publish on website** on each media card you want visitors to see.
5. Open **View website**. Published images and videos appear in the public **Latest studio work** gallery and are also placed into the service cards in publication order. The first published media item is shown on the first service card, the second on the second card, and so on. Videos have playback controls. The public media refreshes automatically while the page is open and also loads when it is opened or refreshed.

To use an uploaded image or video as the public hero media, select **Use in hero** on its card. This updates the hero media URL and type in the page content. Hero media is displayed at the top of the public site; gallery publication is a separate control. Select **Remove from website** to hide an item from the gallery while keeping it in the admin library. Select **Archive** to remove it from the active media library.

### Other components in `App.jsx`

- `AuthDialog`: sign-in and account creation form. Account creation offers Customer and, when initial setup is available, Administrator. The server controls whether an administrator can actually be created.
- `Notice`: dismissible success or error notification.
- `DecorationCard`: public collection item display.
- `ContentManager`: dynamic editor for public site copy.
- `MediaManager`: upload and reuse site media.
- `EditRecordDialog`: edit dialog for a category or decoration.
- `RequestTable`: administrator view for service requests and status updates.
- `MessageRow`: administrator message display and reply editor.

## Shared components

### `src/components/Navbar.jsx`

The navigation bar receives the signed-in user, view state, site copy, and event handlers as props. Visitors see public navigation and sign-in/create-account actions. Customers see **My account** or **View website**, based on the current view. Administrators see **Studio dashboard** or **View website**. The component does not make API requests itself; its buttons call handlers owned by `App`.

### `src/components/Footer.jsx`

The footer reads brand and tagline copy from props, using fallback text if the content has not loaded. It calculates the copyright year in the browser.

## Backend communication: `src/lib/api.js`

This file centralizes the frontend's network calls.

`API_BASE` is selected in this order:

1. `VITE_API_URL`, if set when Vite starts.
2. `/api` when the frontend is served from port 5000 or 5001.
3. The current page's protocol and hostname at port 5000, followed by `/api`, for a separate development frontend such as port 3001.

Set `VITE_API_URL` in the client environment when the backend uses a different address. For example:

```text
VITE_API_URL=http://127.0.0.1:5000/api
```

Restart Vite after changing environment variables. Vite exposes variables prefixed with `VITE_` to client code; do not put passwords, database credentials, or signing secrets in client environment variables.

`api(path, options, token)` sends JSON requests, adds an `Authorization: Bearer ...` header when a token is supplied, parses JSON responses, and turns backend failures into JavaScript errors. A network or CORS failure is reported as a connection error. `send(method, body)` creates the JSON request options used by forms. `uploadFile(path, file, token)` sends a file body with its MIME type and authorization header.

Common API paths used by the client include:

| Purpose | API paths |
| --- | --- |
| Public website data | `/categories`, `/decorations`, `/site-content`, `/media` |
| Authentication | `/auth/register`, `/auth/setup-admin`, `/auth/login`, `/auth/me`, `/auth/setup-status` |
| Public forms | `/service-requests`, `/messages` |
| Customer account | `/customer/service-requests`, `/customer/messages` |
| Administrator workspace | `/service-requests`, `/messages`, `/site-content`, `/admin/media`, `/categories`, `/decorations` |

The server decides which operations are allowed. Hiding a button in React is not an authorization check; protected API operations must remain protected by server authentication and role middleware.

## Stylesheets

`src/styles.css` contains the main visual system and styles for the public site, header, forms, account dialogs, admin workspace, and customer dashboard. It defines shared colors and responsive layouts. Customer dashboard rules are grouped under `.customer-area`, `.customer-section`, and related classes.

`src/public.css` contains supplementary public gallery, service-card, and responsive styles. `main.jsx` imports it after `styles.css`, so those styles are included in the client bundle.

Prefer reusing existing class names and CSS variables when extending the design. Responsive breakpoints are defined in the CSS. Check both desktop and narrow-screen layouts when changing grids, forms, navigation, or dashboard panels.

## Authentication and account roles

The browser stores the signed-in bearer token in local storage as `gather-token`. The token identifies a session; the server remains responsible for validating it and looking up the active user. Do not store the password in browser storage or log it.

Registration can request a customer account. Administrator creation is limited by the backend's initial setup rule and setup-status endpoint. Later registrations cannot grant themselves administrator access just by changing the form value. The UI routes users based on the role returned by the API, not only the value selected in the browser.

The same browser origin must be allowed by the Express server's CORS configuration. When using Vite on a local port, make sure that origin is included in the server's `CLIENT_URL` configuration. A browser can report a CORS rejection as a generic fetch failure.

## Editing guidance

- Keep API calls in event handlers or effects, and use the shared `api` helper so token and error behavior stay consistent.
- Keep role checks and data ownership enforcement on the server; client-side conditions are only for presentation.
- Use React state for values that affect the rendered page. Avoid directly changing rendered DOM except where the existing forms rely on browser form behavior.
- When adding an API-backed feature, document its endpoint and expected authentication, handle loading and error states, and refresh visible data after successful mutations.
- Keep public fallback copy in `defaultSiteContent` when adding an editable public text field, and add the field to `pageContentFields` if administrators should be able to edit it.
- Keep the form payload aligned with server-side request validation and model fields.

## Troubleshooting

**The public catalog says the server cannot be reached.** Confirm the Express server is running, check the `VITE_API_URL`/default API address, and confirm the frontend origin is allowed by backend CORS settings.

**Sign-in returns to the public page.** Confirm the API returned a valid user and token, and inspect the browser's network response for `/auth/login` or `/auth/me`. An expired token is removed automatically.

**The dashboard is blank or does not appear.** Confirm the current account role, refresh the page, and inspect the browser console for React runtime errors. Confirm the client page is from the development server or a newly built `client/dist`, not an older build.

**A customer cannot see a prior request.** The account dashboard only lists requests associated with the currently authenticated user. Requests submitted before account linking may not appear in the account history.

**The production page does not show recent React edits.** Run `npm run build` from `client` and restart or refresh the process serving `client/dist`.
