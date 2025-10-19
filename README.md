# Habitsu - Habit Tracker with Heatmap

**Habitsu** is a full-stack habit tracker inspired by GitHub's contribution heatmap. It features authentication, responsive UI, and database schema design. Users can track private and public goals, view goal statistics such as current and longest streaks, and maintain daily notes. Built with **React**, **Prisma**, **PostgreSQL**, and **TailwindCSS**.  


## Overview

Habitsu allows users to:  
- Track habits and daily goals  
- View statistics such as current streaks and longest streaks  
- Maintain daily notes for each goal  
- Set goals as private or public  
- Explore a contribution heatmap-style visualization  
- Enjoy a mobile-first interface

## Tech Stack

### Frontend
| Category      | Technology |
|---------------|------------|
| Framework     | [React](https://react.dev) [(Vite)](https://vite.dev) |
| Language      | [TypeScript](https://www.typescriptlang.org) |
| Styling       | [TailwindCSS](https://tailwindcss.com/) |
| UI Components | [Shadcn](https://ui.shadcn.com/) / [Radix UI](https://www.radix-ui.com/) |
| Data Fetching | [TanStack Query](https://tanstack.com/query) |
| Routing       | [TanStack Router](https://tanstack.com/router) |
| Design / Prototyping | [Figma](https://figma.com) |

### Backend
| Category        | Technology |
|-----------------|------------|
| Framework       | [NestJS](https://nestjs.com) |
| Language        | [TypeScript](https://www.typescriptlang.org) |
| ORM             | [Prisma](https://www.prisma.io/) |
| Database        | [PostgreSQL](https://www.postgresql.org/) |
| Authentication  | [PassportJS](http://www.passportjs.org/) |

### Shared
| Category    | Technology |
|-------------|------------|
| Language    | [TypeScript](https://www.typescriptlang.org) |
| Validation  | [Zod](https://zod.dev/) |

## Screenshots

| Dashboard / Heatmap | Goal Details | Daily Notes |
|-------------------|--------------|-------------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Goal Details](docs/screenshots/goal.png) | ![Daily Notes](docs/screenshots/notes.png) |

TODOs screenshots `docs/screenshots/`

## Getting Started

Instructions for setting up and running the app locally:

<!-- TODOs update this for backend, frontend, shared commands -->

### 1. Clone the repository
```bash
git clone https://github.com/shirley543/habitsu.git
cd habitsu
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
Create a .env file in the project root with:
```bash
VITE_MAPBOX_TOKEN=your_mapbox_token
```

### 4. Run the development server
```bash
npm run dev
```
Open http://localhost:5173


## Contributors
Shirley Xiao - [Github](https://github.com/shirley543) - [LinkedIn](https://www.linkedin.com/in/shirley-xiao-a59a99134)


## License
This project is licensed under the MIT License.


## Future Work
- TODOs
