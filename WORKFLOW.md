# Project Workflow

This document outlines the development and documentation workflow for this project. Following these guidelines will help to streamline development, improve code quality, and maintain clear documentation.

## Git Branching Strategy

We use a simple feature-branching workflow. All new work, including features and bug fixes, should be done in a dedicated branch.

-   **`main` branch:** This branch represents the production-ready code. Direct pushes to `main` are not allowed. Changes are merged into `main` through pull requests.
-   **Feature branches:** When you start working on a new feature or bug fix, create a new branch from `main`. Name your branch descriptively, using a prefix like `feature/` or `fix/`. For example:
    -   `feature/user-authentication`
    -   `fix/login-button-bug`

## Development Process

1.  **Create an issue:** Before starting work, create an issue in the project's issue tracker that describes the feature or bug you will be working on.
2.  **Create a branch:** Create a new branch from the `main` branch.
    ```bash
    git checkout main
    git pull origin main
    git checkout -b feature/your-feature-name
    ```
3.  **Local Development:**
    -   Run the development server to see your changes live.
    -   Write your code, following the existing coding style and conventions.
    -   Add or update unit tests for your changes.
4.  **Commit your changes:** Make small, logical commits with clear and concise commit messages.
    ```bash
    git add .
    git commit -m "feat: Add user authentication"
    ```
5.  **Lint and Format:** Before pushing your changes, make sure to lint and format your code.
    ```bash
    pnpm lint
    pnpm format
    ```
6.  **Push your branch:**
    ```bash
    git push origin feature/your-feature-name
    ```
7.  **Create a Pull Request (PR):** Go to the repository on GitHub and create a new pull request from your feature branch to the `main` branch.
    -   Fill out the PR template, linking to the issue you created.
    -   Describe your changes and include any relevant screenshots.
8.  **Code Review:** At least one other team member must review and approve your PR.
9.  **Merge:** Once the PR is approved and all checks have passed, it can be merged into `main`.

## Documentation Workflow

-   **`README.md`:** The `README.md` file should contain a high-level overview of the project, setup instructions, and basic usage.
-   **`WORKFLOW.md`:** This file (the one you're reading) documents the development process.
-   **Code Comments:** Use comments in your code to explain complex logic.
-   **Component Documentation:** For UI components, consider using a tool like Storybook to document their props and usage.
-   **API Documentation:** If the project includes an API, use a tool like Swagger or Postman to generate and maintain API documentation.
