# React TypeScript Starter Project

This is a starter project for a React application using TypeScript.

## Description

This project is a simple starter project for anyone looking to start a ReactJs project with TypeScript. It provides a set of tools and practices that work well together and provide a solid base to build your project.

## Getting Started

### Dependencies

This project uses the following dependencies:

- React 18.2.0
- TypeScript
- Redux Toolkit 2.2.1
- Axios 1.4.0
- Jest 29.7.0
- Node Sass 7.0.3

### Node Version

This project uses Node.js and it's recommended to use the version specified in the `.nvmrc` file. If you're using [nvm](https://github.com/nvm-sh/nvm) (Node Version Manager), you can switch to the correct version with `nvm use`.

### Installing

1. Clone the repository
2. Install the dependencies with `npm install`

### Executing program

- To start the development server, run `npm start`
- To create a production bundle, use `npm run build`

## Scripts

This project includes the following scripts:

- `npm start`: Starts the development server.
- `npm run build`: Creates a production bundle.
- `npm test`: Runs the test suite.
- `npm run storybook`: Starts the Storybook.
- `npm run build-storybook`: Builds the Storybook.

## Project Structure

- `src/`: This directory contains all of the source code for the React application.
  - `components/`: This directory contains all the React components.
  - `common/`: This directory contains all the common components that can be reused.
  - `pages/`: This directory contains the pages of application for which all the routes are defined.
  - `constants/`: This directory contains all file with common constant values that can be used all over the application.
  - `store/` & `reducers/` & `actions/`: This directory contains all the Redux state management files.
  - `services/`: This directory contains all the service files, like API calls.
  - `utils/`: This directory contains all the utility files.
- `public/`: This directory contains static assets that are used by the application.
- `.storybook/`: This directory contains Storybook configuration files.
- `.env`: This file contains the environment variables for the application.
- `coverage/`: This directory contains coverage reports for your tests.

## Usage

1. Clone the repository
2. Install the dependencies with `npm install`
3. Start the development server with `npm start`
4. Open [http://localhost:3000](http://localhost:3000) to view the application in the browser.

## Help

If you encounter any problems or have any questions, please open an issue.

## Authors

[Your Name](your-link)

## Version History

- 1.0.0
  - Initial Release
