# 💳 Payment Search Challenge

Welcome to the Payment Search Challenge! This is a frontend coding challenge designed to assess your ability to implement a payment search feature using modern web technologies.

Your task is to build a payment search interface that allows users to:

- View payment details organised in a table
- Search for payments by payment ID & currency and clear filters
- Handle various edge cases and error states
- Implement pagination for the table

## 📑 Table of Contents

- [🛠️ Tech Stack](#️-tech-stack)
- [📡 API Documentation](#-api-documentation)
  - [Search Payments Endpoint](#search-payments-endpoint)
  - [Available Test Data](#available-test-data)
- [🌐 Localization (i18n)](#-localization-i18n)
- [📝 Evaluation Criteria](#-evaluation-criteria)
- [💡 Tips](#-tips)
- [📋 Implementation Steps](#-implementation-steps)
  - [Step 1: Basic Payment List](#step-1-basic-payment-list-)
  - [Step 2: Search by Payment ID](#step-2-search-by-payment-id-)
  - [Step 3: Clear Filters](#step-3-clear-filters-)
  - [Step 4: Handle Payment Not Found](#step-4-handle-payment-not-found-)
  - [Step 5: Handle Server Error](#step-5-handle-server-error-)
  - [Step 6: Currency Filter](#step-6-currency-filter-)
  - [Step 7: Combined Currency and Payment ID Filter](#step-7-combined-currency-and-payment-id-filter-)
  - [Step 8: Pagination](#step-8-pagination-)

> **Note**: We don't expect candidates to complete all steps. Please work your way through the steps incrementally, focusing on quality over quantity. Each step builds upon the previous one, so take your time to implement each feature properly.

## 🛠️ Tech Stack

The project comes with the following pre-configured technologies:

- **React 19** - For building the user interface
- **TypeScript** - For type safety and better developer experience
- **Tailwind CSS** - For styling and responsive design
- **MSW (Mock Service Worker)** - For API mocking
- **Vitest** - For testing
- **Testing Library** - For component testing

> **Note**: You are free to use additional libraries, packages, or technologies to solve this challenge. Feel free to install and use any dependencies that will help you implement the features more effectively or improve the user experience.

> **Important**: You'll discuss your implementation in a technical interview, including your architectural decisions, trade-offs, and alternative approaches you considered. Make sure you understand every line of code you submit.

## 📡 API Documentation

The project uses MSW to mock the payment search API. The API URL is defined in `src/constants/index.ts` as `API_URL = "/api/payments"`.

### Search Payments Endpoint

**Endpoint:** `GET /api/payments`

**Description:** Search and retrieve payments with filtering and pagination support.

#### Query Parameters

| Parameter  | Type   | Required | Default | Description                                                                                                |
| ---------- | ------ | -------- | ------- | ---------------------------------------------------------------------------------------------------------- |
| `search`   | string | No       | `""`    | Search term to filter payments (supports Payment ID, Status, Currency, Customer Name)                      |
| `currency` | string | No       | `""`    | Filter by currency code (`USD`, `EUR`, `GBP`, `AUD`, `CAD`, `ZAR`) - available in `src/constants/index.ts` |
| `page`     | number | No       | `1`     | Page number for pagination                                                                                 |
| `pageSize` | number | No       | `5`     | Number of payments per page                                                                                |

#### Request Examples

```bash
GET /api/payments?search=pay_134&currency=USD&page=1&pageSize=5
```

#### Response Format

**Success Response (200 OK):**

```json
{
  "payments": [
    {
      "id": "pay_123456789",
      "customerName": "John Doe",
      "amount": 150.0,
      "customerAddress": "123 Main St, City, Country",
      "currency": "USD",
      "status": "completed",
      "date": "2024-01-15T10:30:00Z",
      "description": "Payment for services",
      "clientId": "cli_123"
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 5
}
```

#### Available Test Data

The mock API includes the following payment IDs for testing:

- `pay_134_1`, `pay_134_2`, `pay_134_3`, `pay_134_4`, `pay_134_5` - Various payment statuses
- `pay_205_1`, `pay_205_2`, `pay_205_3`, `pay_205_4`, `pay_205_5` - Multiple payments with different currencies
- `pay_404` - Returns `404` error
- `pay_500` - Returns `500` error

## 🌐 Localization (i18n)

**Important**: Use the i18n constants for all user-facing text. All strings can be found in the constants files:

- **Main i18n strings**: `src/constants/i18n.ts` - Contains all user-facing text including labels, buttons, messages, and table headers

Import the i18n constants like this:

```typescript
import { I18N } from "./constants/i18n";
```

**Note**: These strings are used by our tests and scoring system, so using the exact i18n constants is required for your solution to pass validation.

## 📝 Evaluation Criteria

Your solution will be evaluated based on:

- 🧹 Clean, maintainable code
- 🔒 Proper TypeScript usage
- 🏗️ Well-structured components
- 🎯 Efficient state management

## 💡 Tips

- **Start with Step 1 and work through each step incrementally**
- Run tests after each step to verify your progress
- Keep accessibility in mind throughout development
- Use TypeScript effectively
- Test with the provided payment IDs to verify error handling
- Don't hesitate to install additional packages if they help you solve the problem more efficiently
- Consider using libraries for state management, form handling, or UI components if they improve your solution

## 📋 Implementation Steps

This challenge is designed to be completed incrementally. Each step builds upon the previous one, and you can run tests to verify your progress.

Good luck! 🚀

### Step 1: Basic Payment List ✅

**Goal**: Fetch and display payments in a table with proper formatting

**Requirements**:

- Fetch payments from the API with `page=1` and `pageSize=5`
- Display payments in a table with headers using i18n strings (see `src/constants/i18n.ts`)
- Format amounts and dates as per the example in the screenshot

![Payments Page](./docs/payments_page.png)
_The main payments interface showing the search form, filters, and payment table_

**Test to pass**: `App - Step 1: Basic Payment List`

**Command to run**: `npm run test:step1`

### Step 2: Search by Payment ID ✅

**Goal**: Add search functionality for payment IDs

**Requirements**:

- Add a search input with proper ARIA labels
- Add a search button
- Implement search functionality that queries the API
- Use the i18n strings for labels and placeholders (see `src/constants/i18n.ts`)

![Search by Payment ID](./docs/search_by_payment_id.png)
_Search input for payments by payment ID_
![Search by Payment ID](./docs/search_by_payment_id_with_search.png)
_Searching for payments by payment ID with results displayed in the table_

**Test to pass**: `App - Step 2: Search by Payment ID`

**Command to run**: `npm run test:step2`

### Step 3: Clear Filters ✅

**Goal**: Add ability to clear all active filters

**Requirements**:

- Show a "Clear Filters" button when any filter is active
- Reset the search input to empty
- Hide the clear button when no filters are active

![Clear Filters](./docs/clear_filters.png)
_Clear Filters button_

**Test to pass**: `App - Step 3: Clear Filters`

**Command to run**: `npm run test:step3`

### Step 4: Handle Payment Not Found ✅

**Goal**: Display appropriate error message when payment is not found

**Requirements**:

- Handle 404 responses from the API (use `pay_404` as the payment ID)
- Display the error message from i18n constants
- Show the error message in a user-friendly way

![Payment Not Found](./docs/payment_not_found.png)
_Error message displayed when a payment is not found (404 error)_

**Test to pass**: `App - Step 4: Handle Payment Not Found`

**Command to run**: `npm run test:step4`

### Step 5: Handle Server Error ✅

**Goal**: Display error message for server errors

**Requirements**:

- Handle 500 responses from the API (use `pay_500` as the payment ID)
- Display the appropriate error message from i18n
- Ensure the error is clearly visible to users

![Internal Server Error](./docs/internal_server_error.png)
_Error message displayed when a server error occurs (500 error)_

**Test to pass**: `App - Step 5: Handle Server Error`

**Command to run**: `npm run test:step5`

### Step 6: Currency Filter ✅

**Goal**: Add currency filtering functionality

**Requirements**:

- Add a currency dropdown with all available currencies
- Filter payments by selected currency
- Use proper ARIA labels for accessibility
- Include all currencies: USD, EUR, GBP, AUD, CAD, ZAR (see `src/constants/index.ts`)
- Clear all filters clicked should clear the currency filter

![Filter by Currency](./docs/filter_by_currency.png)
_Filtering payments by currency using the dropdown selector_

**Test to pass**: `App - Step 6: Currency Filter`

**Command to run**: `npm run test:step6`

### Step 7: Combined Currency and Payment ID Filter ✅

**Goal**: Ensure currency and payment ID filters work together

**Requirements**:

- Allow filtering by both currency and payment ID simultaneously
- Ensure the API receives both filter parameters
- Display results that match both criteria

![Filter by Payment ID and Currency](./docs/filter_by_payment_id_and_currency.png)
_Filtering payments by payment ID and currency_

**Test to pass**: `App - Step 7: Combined Currency and Payment ID Filter`

**Command to run**: `npm run test:step7`

### Step 8: Pagination ✅

**Goal**: Implement pagination functionality

**Requirements**:

- Display pagination controls (Previous/Next buttons) (use the [i18n strings for the buttons](./src/constants/i18n.ts) the icons are unicode characters in the i18n strings)
- Show current page number (e.g., "Page 1")
- Disable Previous button on first page
- Enable Previous button after navigating to next page
- Show different payments on different pages
- Allow navigation back to previous pages

### Pagination

![Paginate Payments](./docs/paginate_payments_page_1.png)
_Pagination controls allowing navigation between pages of results_

![Paginate Payments](./docs/paginate_payments_page_2.png)
_Pagination controls allowing navigation between pages of results_

**Test to pass**: `App - Step 8: Pagination`

**Command to run**: `npm run test:step8`

## Solution notes

### What I would do to make this a production grade app

1. **Scale client state management when needed.** Local React state is sufficient for the current filters and pagination. If client state becomes more complex or needs to be shared across multiple pages, Zustand or Redux could help organize updates. Server state would remain managed by TanStack Query.
2. **Consider virtualization for larger tables.** Server-side pagination keeps the current rendered list small. If the interface evolves to display many rows at once, TanStack Virtual could render only the visible rows to reduce DOM size and rendering work. This should be guided by measured performance and retain accessible table navigation.
3. **Distinguish refresh failures from initial failures.** The current page shows the same error view for both cases and hides the table after a failed refresh. A dedicated refresh-error state could explain that the update failed and offer a retry action, with the option to keep previously loaded results visible and clearly marked as potentially outdated.
4. **Add a deliberate retry policy.** Automatic retries are currently disabled. A future improvement could retry transient network or server failures with a limited attempt count and backoff, while avoiding retries for validation errors or other failures that require different input. An explicit Retry button would also let users recover without changing their filters.
5. **Improve accessible loading and navigation feedback.** Add a persistent status region that announces initial loading, background refreshes, and result counts.
6. **Tune TanStack Query to the use case.** The app already uses `useQuery` for paginated requests. For production, I would tune cache freshness, retention, refetch triggers, and invalidation around how frequently payments change and how current the displayed data needs to be. I would consider `useInfiniteQuery` for a load-more or infinite-scroll interface, or `useSuspenseQuery` when loading and error handling are coordinated through Suspense and error boundaries. Each approach should follow the interaction requirements rather than replace the current pagination without a clear benefit.
7. **Consolidate styling around shared design tokens.** Styling currently spans Tailwind utilities, styled-components, and global CSS. I would establish a consistent styling approach with a central source for design tokens such as colors, spacing, typography, border radii, and breakpoints. Components would consume those tokens so design changes can be made in one place, reducing duplicated values and keeping the interface consistent.

### Folder structure

The implementation separates API access, server state, page orchestration, and presentation. Tests live alongside the code they cover.

```text
src/
├── components/   # Component folders with colocated props and tests
├── api/          # API functions grouped by resource/controller
├── hooks/        # Reusable hooks, including server-state management
├── Pages/        # Complete pages that compose components and manage page state
├── schemas/      # Zod schemas for runtime validation and inferred types
├── types/        # Domain-specific and shared TypeScript types
└── utils/        # Shared utility functions and their tests
```

1. **Components:** Each feature component has its own folder containing its implementation, props/configuration, and tests. Shared styled elements live in `components/components.tsx`.
2. **API:** API functions are grouped by resource/controller so related endpoints are easy to find. For example, `api/payments/getPayments.ts` validates request parameters, fetches payments, and validates the response.
3. **Hooks:** `usePayments` manages server state through TanStack Query's `useQuery`, including fetching, caching, refetching, request cancellation, and query status. It also maps errors to the types used by the UI.
4. **Pages:** `Pages/PaymentsPage.tsx` composes the complete payments page. It owns the draft search and applied filters, coordinates pagination, and connects query state to the components.
5. **Schemas:** Zod schemas define runtime validation rules. TypeScript types are derived from these schemas using `z.input` for request inputs and `z.infer` for validated data, keeping validation and types aligned.
6. **Types:** Types are grouped by usage. `types/payment.ts` contains payment-specific types, while `types/types.ts` contains shared status and error definitions.
7. **Utils:** Shared functions, such as date and currency formatting, live in `utils/` with their tests.

### AI notes

This section is a starting map for an AI coding agent. Use it to locate the relevant implementation and tests quickly; confirm the current code before changing behavior, since these notes can become outdated. Work within the requested scope and preserve unrelated local changes.

#### Architecture and ownership

The application is a client-rendered React/Vite app. The main flow is:

```text
main.tsx → App.tsx (QueryClientProvider) → Pages/PaymentsPage.tsx
  → hooks/usePayments.ts → api/payments/getPayments.ts → /api/payments
  → payment-search, payment-table, pagination, payments-error-box
```

| Change needed | Start here |
| --- | --- |
| Filter state, search submission, pagination resets, page views | `src/Pages/PaymentsPage.tsx` |
| Query keys, freshness, caching, refetch state, error classification | `src/hooks/usePayments.ts` |
| HTTP parameters, cancellation, request/response validation | `src/api/payments/getPayments.ts` |
| Runtime data contract | `src/schemas/payment.ts` |
| Schema-derived payment types and shared enums | `src/types/payment.ts`, `src/types/types.ts` |
| Table rows, skeletons, empty results | `src/components/payment-table/paymentTable.tsx` |
| Search controls, pagination, error messages | Corresponding folders under `src/components/` |
| Shared styles, labels, formatters | `src/components/components.tsx`, `src/constants/i18n.ts`, `src/utils/utils.ts` |
| Mock API behavior and fixtures | `src/mocks/handlers.ts`, `src/mocks/mockPaymentsData.ts` |

Imports using `@src/` resolve to `src/`; aliases are configured in TypeScript, Vite, and Vitest. Match the actual filename casing when adding imports.

#### Behavior to preserve

- Draft search text does not fetch until submission. Submitted search is trimmed and lowercased. Search submission, currency changes, and clearing filters reset pagination to page 1.
- The query key includes all request params. `isPending` drives the table skeleton; `isRefetching` drives the refresh indicator. Data can be undefined before success. Stale data does not automatically poll: the current hook has no refetch interval.
- Automatic retries are disabled in `App.tsx`. The current page deliberately hides rows after a refresh error, even though TanStack Query retains cached data. A page test records this choice; do not change it without a corresponding behavior requirement.
- `getPayments` parses params before making an HTTP request and parses the unknown response before returning it. Validation failures reject with `ZodError`; transport failures remain Axios errors.
- Request search, currency, and page are required by the wrapper schema; pageSize defaults to `PAGE_SIZE`. An empty currency means no filter. Returned payment currency must be a supported enum value, and customerName/currency cannot be null. Dates require UTC ISO timestamps with seconds and no fractional part, such as `2024-04-15T23:00:00Z`.
- An empty successful response shows the empty message without table pagination. Skeleton rows are decorative, hidden from assistive technology, and respect reduced motion. Put user-facing strings in I18N.
- Development uses browser MSW; tests use `src/mocks/node.ts`. Production mocking is disabled, so a deployed app needs a real `/api/payments` endpoint. Mock scenarios include `pay_empty`, `pay_404`, `pay_500`, and `401`.

#### Setup and verification commands

Run commands from the project root containing `package.json` (`payment-list-challenge-react/` when starting in the parent workspace). Use the Node version in `.nvmrc` (currently 24). If dependencies are missing, install the locked versions with `npm ci`; reuse existing dependencies for routine checks.

```bash
# Start the app; use the URL printed by Vite
npm run dev

# Run all tests once, without npm test's implicit installation step
npx vitest run

# Run a focused suite
npx vitest run src/Pages/PaymentsPage.test.tsx
npx vitest run src/hooks/usePayments.test.ts
npx vitest run src/api/payments/getPayments.test.ts
npx vitest run src/components/payment-table/paymentTable.test.tsx

# Measure coverage; open coverage/index.html to inspect it
npm run test:coverage

# Final verification for code changes
npm run typecheck
npm run lint
npx vitest run
npm run build
```

Tests use Vitest, Testing Library, jsdom, and MSW. A dev server is not required to run them. Start with the affected suite, then run the final checks for implementation changes. Report actual failures and limitations; do not weaken assertions or skip tests to make a run pass. Documentation-only edits do not require the full test suite.

#### Test patterns and troubleshooting

- Keep tests beside the implementation. API tests exercise validation and HTTP behavior through MSW. Hook tests mock `getPayments` to isolate query state. Page tests use the real hook/API with MSW overrides and a fresh QueryClient per test. Component tests focus on rendering and callbacks.
- For query tests, disable retries, clean up renders, clear clients, and reset MSW handlers after each test. When simulating refreshes, invalidate the relevant query key. Remember that fresh cached data can avoid a new request.
- For loading tests, hold a response with a controlled promise and release it explicitly. Scope delays to the test rather than slowing the shared mock handler. Assert result contents within the table so dropdown options cannot satisfy row assertions.
- Keep ordinary payment fixtures valid under the schemas. Isolate intentionally invalid fixtures in validation/defensive tests. Date formatting uses the execution environment's timezone; account for that when asserting formatted UTC dates.
- Vitest writes `junit.xml`; coverage writes `coverage/`; builds write `dist/`. These are generated artifacts. Do not edit them or manually change `public/mockServiceWorker.js`; regenerate the worker with MSW tooling if needed.
- `npm test` currently installs dependencies before running tests; prefer direct Vitest commands for repeatable local verification. The `score` script references `scoring.js`; confirm that file exists before relying on it.
- The production-improvement items below are proposals, not implemented features. Existing passing tests do not replace manual keyboard, VoiceOver, responsive-layout, and real-backend verification.

