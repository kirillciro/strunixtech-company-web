PostgreSQL setup

1) Create a database named techsol (or any name you want).
2) Run migrations in order:

   psql "postgres://postgres:postgres@localhost:5432/techsol" -f 001_init.sql
   psql "postgres://postgres:postgres@localhost:5432/techsol" -f 002_content.sql

3) In backend, copy .env.example to .env and set DATABASE_URL.
