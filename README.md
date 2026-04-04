# Gambling Application

This repository contains a monorepo for a gambling application that includes both a web-based platform and a mobile application.

## System Description

The project is a comprehensive gambling platform designed to provide users with a seamless experience across both web and mobile devices. It features a web interface built with Next.js for browser-based access and a mobile application developed using React Native for on-the-go usage.

## Directory Structure

The repository is organized into two main directories:

-   `src/`: This directory houses the source code for the web application, which is built using the Next.js framework. It includes all the pages, components, and styles necessary for the web platform.

-   `reflect-rn/`: This directory contains the source code for the React Native mobile application. It is set up as an Expo project, allowing for cross-platform development for both iOS and Android devices.

## Workflow

The application follows a standard user workflow:

1.  **Authentication**: Users can log in to their accounts to access personalized features.
2.  **Navigation**: Once logged in, users can navigate through various sections of the application, including:
    -   **Home**: The main dashboard or landing page.
    -   **Diary**: A section for users to keep track of their activities.
    -   **Learn**: Educational content related to gambling.
    -   **Profile**: User account and profile information.
    -   **Settings**: Application settings and preferences.
3.  **Interaction**: Users can interact with the features available in each section, with data synchronized between the web and mobile platforms.

## Configuration and Setup

To set up and run the applications on a new device, follow the instructions below.

### Web Application (Next.js)

1.  **Navigate to the root directory**:
    Open your terminal and navigate to the root of the project folder.

2.  **Install dependencies**:
    Run the following command to install the necessary packages:
    ```bash
    npm install
    ```

3.  **Run the development server**:
    Start the Next.js development server with this command:
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:3000`.

### Mobile Application (React Native)

1.  **Navigate to the mobile app directory**:
    In your terminal, change to the `reflect-rn` directory:
    ```bash
    cd reflect-rn
    ```

2.  **Install dependencies**:
    Install the required packages for the React Native application:
    ```bash
    npm install
    ```

3.  **Start the Expo development server**:
    Run the following command to start the Expo server:
    ```bash
    npx expo start
    ```
    This will open the Expo developer tools in your browser. You can then run the application on a physical device using the Expo Go app or on an emulator/simulator.

