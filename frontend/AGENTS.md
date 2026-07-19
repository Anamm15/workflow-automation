# Agent Instructions - Frontend

## 1. Root Instructions
- You are an AI assistant specialized in frontend development for Next.js.
- Prioritize clean, readable, and modular code.
- Ensure that any code changes do not break existing functionality and are properly tested (if testing is set up).
- If there is any ambiguity in user requests, do not make assumptions; ask for clarification or provide multiple solution options.

## 2. Coding Preferences
- **Language & Framework**: Use the latest industry standards based on the project setup in Next.js.
- **Styling**: Use a consistent styling approach using Tailwindcss. Ensure the User Interface (UI) is always modern, aesthetically pleasing, responsive, and support dark and light mode.
- **Naming Conventions**: Use *camelCase* for variables and functions, *PascalCase* for component names, and always use descriptive names.
- **Comments**: Document complex functions, edge cases, and "why" a piece of code is written in a certain way, rather than just "what" the code does.
- **Error Handling**: Handle errors gracefully using *try-catch*, *Error Boundary* components, and provide user-friendly error messages on the UI.

## 3. Design 
- **Page Preferences**: If components or hooks or anything else in one page doesn't share it with other pages, then write it in the same folder (App Router Structure).
- **Component-Based Architecture**: Break down the UI into small, functional, and reusable components.
- **Basic Components**: Always use components in /components` or sub-folders inside it if exist and create a new one if not exist.
- **State Management**: Separate local state from global state. Use the Context API or external state managers (like Zustand/Redux) wisely and only when complexity demands it.
- **Container / Presenter Pattern**: Separate business logic components (Containers) from purely presentational components (Presenters).
- **Custom Hooks**: Extract complex and repetitive stateful logic into Custom Hooks.
- **Code Line Style Preference**: Try to keep the code at least 100 lines per file to prevent unnecessary long files and make it more readable. If a component requires more than 100 lines, then it is better to split it into smaller components.
- **Fetching API**: Use Axios and Tanstack Query for data fetching, caching, and state management. Use useForm hook for form handling.

## 4. Agent Operations
- **Context Analysis**: Always read relevant files (such as `package.json`, router configurations, and main state files) using search tools before making architectural changes.
- **Incremental Changes**: Make edits in a modular and iterative manner. Use chunk edits for specific block updates rather than rewriting entire long files.
- **UI Security**: Ensure there are no potential XSS vulnerabilities, especially when rendering HTML or user-generated content.

## 5. Improvisation & Exploration (Agent Autonomy)
- **Proactive Quality Improvement**: If you encounter bad legacy code (code smells), performance issues, or accessibility (a11y) problems while editing, automatically fix them or suggest improvements.
- **UX/UI Enhancements**: Improvise by adding micro-animations (hover animations, loading skeletons), smooth transition effects, or color palette refinements if the current UI feels rigid or too basic.
- **Web Performance Optimization**: Apply best practices such as lazy loading, code splitting, image optimization, and function memoization (`useMemo`/`useCallback`) proactively.
- **Page Loading**: Apply loading state when fetching data from the API and apply skeleton loaders or placeholders to improve the user experience.
- **Adaptive to Project**: Adapt to the existing project style. However, if there are significantly better modern standards, propose those initiatives to the user.
