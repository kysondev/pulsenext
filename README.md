# Phizy-Stack CLI

Phizy-Stack is a command-line interface (CLI) tool designed to simplify the process of setting up full-stack Next.js projects with custom templates and prewritten modules. It allows you to quickly bootstrap new projects and integrate essential, pre-configured features like authentication, payment systems, databases, and many other modules, all ready to use.  
This tool was originally created for personal use, but I'm sharing it here for others who may find it useful.

---

## Features

- **Create a new Next.js project**: Generate a new project using `phizy-stack` custom template in seconds.
- **Add prewritten modules**: Easily integrate a wide range of pre-configured modules to your project, such as authentication, payment systems, databases (PostgreSQL + Prisma), API integrations, and more.

---

## Installation

To get started with `phizy-stack`, you need to have **Node.js** installed on your machine. You can install it from [here](https://nodejs.org/).

### Install Phizy-Stack CLI globally

To install `phizy-stack` globally on your system, run:

```
npm install -g phizy-stack
```

---

## Usage

### 1. Create a New Project

To create a new full-stack Next.js project with `phizy-stack`, run:

```
phizy-stack create <project-name>
```

This will generate a new Next.js project using a predefined template. Replace `<project-name>` with the name you want for your new project.

### 2. Add Prewritten Modules

Once your project is created, you can add pre-configured modules to it by using the following syntax:

```
phizy-stack add <module-name>
```

Replace `<module-name>` with the name of the module you wish to add to your project. Some examples of modules include `auth`, `payment`, `database`, etc. You can add as many modules as you need for your project.

---

## Example Workflow

1. Create a new project using `phizy-stack`:

   ```
   phizy-stack create my-nextjs-app
   ```

2. Navigate to your project directory:

   ```
   cd my-nextjs-app
   ```

3. Add authentication:

   ```
   phizy-stack add auth
   ```

## Available Modules

Here’s a non-exhaustive list of the modules you can add to your projects:

- **PostgreSQL + Prisma** (`database`)
- **Authentication** (`auth`)
- **Payment System** (`payment`) _Coming soon_
- More Coming Soon...

If you're missing a specific module, feel free to add it and contribute!

---

## Contributing

This project was originally created for personal use, but feel free to fork the repository, contribute, or modify it for your own needs. Pull requests for new modules, bug fixes, and improvements are always welcome!

---

## License

Phizy-Stack is open-source and available under the [MIT License](LICENSE).

---

## Roadmap

- [x] Add database modules
- [x] Add phizy-stack remove module command
- [x] Add auth modules
- [x] Add turborepo & docs page
- [ ] Add payment modules
- More coming soon!
