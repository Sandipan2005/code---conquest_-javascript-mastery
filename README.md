# Code & Conquest: JavaScript Mastery

This guide will help you set up, run, and troubleshoot the project step by step.

## Prerequisites
- **Node.js** (v18 or later recommended)
- **Yarn** (recommended for this project)

## 1. Clone or Download the Project
If you haven't already, clone or download the project to your local machine.

## 2. Install Dependencies
Open a terminal in the project root and run:

```
yarn install
```
If you don't have Yarn installed, run:
```
npm install -g yarn
```
then repeat the above command.

## 3. Set Up Environment Variables
Create a file named `.env` in the project root with the following content:

```
VITE_API_KEY=your_gemini_api_key_here
```
Replace `your_gemini_api_key_here` with your actual Gemini API key.

## 4. Install Peer Dependencies (if needed)
If you see errors about missing peer dependencies, run:
```
yarn add @modelcontextprotocol/sdk
```

## 5. Start the Development Server
Run:
```
yarn run dev
```
The app will be available at the URL shown in the terminal (e.g., http://localhost:5173/).

## 6. Troubleshooting
- **Blank Page:**
  - Make sure your `.env` file is present and contains a valid API key.
  - Make sure you are using Yarn, not npm, for installing and running the project.
  - If you see build errors about `@google/genai` or `@modelcontextprotocol/sdk`, install the missing package as shown above.
  - Try deleting `node_modules` and `yarn.lock` (or `package-lock.json`), then run `yarn install` again.
- **Build Errors:**
  - Run `yarn build` to check for build-time errors. Fix any multi-line string issues by using backticks (`` ` ``) for template literals.
- **API Errors:**
  - Ensure your API key is valid and has the correct permissions.

## 7. Build for Production
To build the app for production:
```
yarn build
```

To preview the production build:
```
yarn run preview
```

## 8. Additional Notes
- Do not use `npm install` or `npm run dev` for this project; always use Yarn for consistency.
- If you update dependencies, always re-run `yarn install`.
- For any issues, check the browser console and terminal output for error messages.

---

Enjoy your journey in Code & Conquest: JavaScript Mastery!
