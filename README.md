
# Amazon.in Cart Automation Assignment

This project is a Playwright + TypeScript automation solution for the Amazon India cart assignment.

It automates the following scenario on [amazon.in](https://www.amazon.in/):

1. Log in with a real Amazon account
2. Search for the requested iPhone product
3. Open the matching product
4. Capture the product price on the product detail page
5. Add the product to cart
6. Verify the cart item, unit price, and subtotal
7. Increase the quantity and verify the new subtotal
8. Select the gift option and verify the gift indicator

## Tech Stack

- Playwright Test
- TypeScript
- Node.js
- Page Object Model
- Environment variables for credentials

## Project Structure

```
.
|-- pages/
|   |-- cart.page.ts
|   |-- home.page.ts
|   |-- product.page.ts
|   `-- search-results.page.ts
|-- tests/
|   `-- amazon-cart.spec.ts
|-- utils/
|   |-- currency.ts
|   `-- env.ts
|-- .env.example
|-- .gitignore
|-- package.json
|-- README.md
```

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Copy `.env.example` to `.env` and fill in your Amazon credentials:
   ```
   AMAZON_EMAIL=your-email@example.com
   AMAZON_PASSWORD=your-password
   AMAZON_PRODUCT_QUERY=iPhone 17 Pro Max 256 GB: 17.42 cm (6.9")
   AMAZON_PRODUCT_MATCH=iPhone 17 Pro Max 256 GB
   ```
   > Never commit your real credentials to the repository.

## Running Tests

- To run tests in headed mode:
  ```
  npm run test:headed
  ```

- To view the Playwright HTML report:
  ```
  npx playwright show-report
  ```

## Error Handling

- The tests log meaningful errors and attach info for debugging.
- Edge cases (e.g., quantity limits) are handled gracefully.

## Environment

- Tests can be run in headed or headless mode.
- Ensure `.env` is properly configured before running.

## Clean Up

- Sensitive data should not be committed.
- Remove unused files before submission.

## Submission

- Submit the project as a zip or via Git repository as per Oracle’s instructions.
|-- playwright.config.ts
|-- tsconfig.json
`-- README.md
```

## What Each File Does

- `tests/amazon-cart.spec.ts`: Main end-to-end test
- `pages/*.ts`: Page Object Model classes for each area of the site
- `utils/env.ts`: Reads required environment variables safely
- `utils/currency.ts`: Parses and formats price values
- `playwright.config.ts`: Playwright configuration
- `.env.example`: Sample environment variables file

## Prerequisites

Before running the project, make sure the following are installed:

- Node.js 18 or later
- npm
- Git
- Google Chrome or Playwright Chromium support on the machine

Check installed versions:

```bash
node -v
npm -v
git --version
```

## Important Notes Before Running

- Use your own Amazon India account credentials
- Run the test in headed mode for best reliability
- Keep the account ready for possible OTP, CAPTCHA, or device verification
- Make sure the cart does not already contain conflicting products if possible

## Installation

### 1. Open the project folder

```bash
cd /path/to/amazon-cart-automation
```

### 2. Install npm dependencies

```bash
npm install
```

### 3. Install Playwright browser binaries

```bash
npx playwright install chromium
```

## Environment Configuration

Create a `.env` file from `.env.example`.

### Linux / macOS / Git Bash

```bash
cp .env.example .env
```

### Windows PowerShell

```powershell
Copy-Item .env.example .env
```

Open `.env` and update the values:

```dotenv
AMAZON_EMAIL=your-email@example.com
AMAZON_PASSWORD=your-password
AMAZON_PRODUCT_QUERY=iPhone 17 Pro Max 256 GB: 17.42 cm (6.9")
AMAZON_PRODUCT_MATCH=iPhone 17 Pro Max 256 GB
HEADLESS=false
AMAZON_LOGIN_TIMEOUT_MS=120000
```

## Environment Variables Explained

- `AMAZON_EMAIL`: Amazon login email or mobile number
- `AMAZON_PASSWORD`: Amazon account password
- `AMAZON_PRODUCT_QUERY`: The full text used in Amazon search
- `AMAZON_PRODUCT_MATCH`: Partial text used to identify the correct result and cart item
- `HEADLESS`: `false` is recommended for live Amazon login
- `AMAZON_LOGIN_TIMEOUT_MS`: Maximum time to wait for login to complete

## How to Run the Test

### Recommended: headed mode

This opens the browser so the user can see what is happening and handle any account challenge screens.

```bash
npm run test:headed
```

### Default mode

```bash
npm test
```

### Debug mode

Use this if the test is failing and you want Playwright Inspector.

```bash
npm run test:debug
```

## What Happens During Execution

The test performs these steps:

1. Opens Amazon India
2. Clicks sign in
3. Logs in with the credentials from `.env`
4. Searches for the requested product
5. Opens the matching result
6. Captures the displayed price
7. Adds the product to cart
8. Verifies the item exists in the cart
9. Verifies the cart price matches the product page price
10. Verifies subtotal for quantity `1`
11. Changes quantity to `2`
12. Verifies the updated subtotal
13. Selects the gift checkbox
14. Verifies the gift indicator is visible

## Viewing the Test Report

After the test run completes, open the Playwright HTML report:

```bash
npm run report
```

Generated artifacts:

- `playwright-report/`: HTML execution report
- `test-results/`: traces, screenshots, and videos for failures

## Example Successful Console Output

```text
Running 1 test using 1 worker

  [chromium] › tests/amazon-cart.spec.ts:10:7 › Amazon.in cart automation › logs in, adds product to cart, updates quantity, and verifies gift option

  1 passed (1m 42s)
```

## Recommended Submission Steps

Once the test passes successfully:

1. Take a screenshot of the terminal output
2. Open the Playwright HTML report
3. Keep both ready for submission
4. Push the code to a public GitHub repository
5. Share the repository link

## How to Push This Project to GitHub

### 1. Create a new repository on GitHub

Go to GitHub and create a new public repository.

Suggested repository name:

```text
amazon-cart-playwright-assignment
```

Do not add:

- README from GitHub
- `.gitignore`
- license

This project already contains local files for that.

### 2. Initialize git if not already initialized

```bash
git init
```

### 3. Set the default branch to `main`

```bash
git branch -M main
```

### 4. Add files to git

```bash
git add .
```

### 5. Create the first commit

```bash
git commit -m "Add Amazon cart automation assignment"
```

### 6. Connect the local project to GitHub

Replace `<your-repo-url>` with the repository URL from GitHub.

```bash
git remote add origin <your-repo-url>
```

Example:

```bash
git remote add origin https://github.com/your-username/amazon-cart-playwright-assignment.git
```

### 7. Push the code

```bash
git push -u origin main
```

## How to Update GitHub After Making Changes

If more edits are made later:

```bash
git add .
git commit -m "Update documentation and test flow"
git push
```

## Suggested Submission Message

Use something simple like this when sharing the assignment:

```text
Hello,

Please find my submission for the test automation assignment below:

GitHub Repository:
https://github.com/your-username/amazon-cart-playwright-assignment

The repository includes:
- Complete Playwright automation source code
- README with setup and execution steps
- Assumptions and known limitations

I have also included the execution output / Playwright report from a successful run.

Thank you.
```

## Assumptions

- The Amazon account is valid and usable on the test machine
- The requested product is available in Amazon India search results during execution
- The product can be added to cart without seller or delivery restrictions
- The cart page allows quantity update and gift selection for the chosen product

## Known Limitations

- Amazon changes locators and page layouts frequently
- Amazon may show CAPTCHA, OTP, MFA, or account verification screens
- Product pricing may change while the test is running
- Search results may differ based on account, location, availability, or promotions
- Some runs may require locator updates if Amazon changes the UI

## Troubleshooting

### Problem: `Missing required environment variable`

Reason:

`.env` is missing or not filled correctly.

Fix:

- Create `.env` from `.env.example`
- Make sure `AMAZON_EMAIL` and `AMAZON_PASSWORD` are set

### Problem: login fails or Amazon asks for OTP / CAPTCHA

Reason:

Amazon detected a new login, suspicious login, or requires verification.

Fix:

- Run in headed mode using `npm run test:headed`
- Complete any manual verification if required
- Re-run the test

### Problem: product is not found

Reason:

Amazon search results may vary.

Fix:

- Update `AMAZON_PRODUCT_QUERY`
- Update `AMAZON_PRODUCT_MATCH`
- Re-run the test

### Problem: subtotal assertion fails

Reason:

Amazon may display a changed price, coupon, shipping variation, or delayed cart update.

Fix:

- Re-check the chosen product
- Confirm the exact item and seller
- Re-run after clearing cart state if needed

## Final Checklist Before Submission

- `npm install` completed
- `npx playwright install chromium` completed
- `.env` configured with real credentials
- test executed successfully
- execution output captured
- Playwright report generated
- code pushed to public GitHub repository
- GitHub link ready to share
