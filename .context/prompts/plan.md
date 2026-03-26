From the requirement.md, split into constituents.md about the required framework and architecture, the spec.md about all the requirements specs, and the tasks.md about the steps that I can review and update status after each step. Update the CLAUDE.md to respect those files and follow the links created by those context docs

here is the general idea about the tasks, you should put more details for better to understand
step 1: create the detail db structure, api specs with validation rules (in .context/spec/ folder)
step 2: create the required framework
step 3: implement the BE, with the migration scripts and seed data, with the swagger so I can review the api spec
Step 4: implement the scheduler tasks using node-schedule, register jobs at startup, update jobs from db using 
step 5: implement the core unit testing for core functions
step 6: implement one integration test using vitest and testcontainers
step 7: write basic specs about screens, including UI components, validation, api calls
step 8: implement the FE

For derived spec output, link the output back to the tasks; update the tasks status when finished

additional constituents needed:
- use monorepo controlled by npm workspace
- use docker compose to host all apps in development mode
- use lts nodejs version for FE and BE
- use expressjs with typescript for BE, with zod for data validation, knex for sql helper and data migration, npm scripts for migration and seeds, vitest for unit testing
- FE: use reactjs with vite, typescript; use redux with redux toolkit query for data fetching and state management, theme and auth status (using localstorage); use shadcn/ui as component library, tailwindcss as css framework; use quilljs react as rich text editor for email body