# PulseNext

PulseNext is a powerful, flexible, and customizable stack for building modern web applications using Next.js. With the PulseNext, you can quickly create new projects and add popular modules (like authentication, payment systems, etc.) to extend your project functionality.

## Features

- **Next.js as the core framework**
- **Easy setup using PulseNext**
- **Modular approach with pre-built templates**
- **Fast and customizable for various project types**

## Quick Start

### Install PulseNext

You can install the PulseNext globally via npm:

```bash
npm install -g pulsenext
```

### Create a New Project

To create a new project, use the create command followed by your desired project name:

```bash
pulsenext create <project-name>
```

This will set up a new Next.js project using the PulseNext base template.

### Add a Module to Your Project

PulseNext comes with various pre-configured modules like authentication, payment, and more. To add a module to your project, use the add command:

```bash
pulsenext add <module-name>
```

Replace `<module-name>` with one of the available modules such as `auth`, `stripe`, etc.

Available Modules

- auth – Add authentication features to your project.
- database - Add Prisma + Postgres integraton to your project.
- email - Add resend intergration with prewritten email templates to your project.
- _More coming soon...._
