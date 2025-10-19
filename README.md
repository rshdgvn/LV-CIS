# La Verdad Club Integrated System (LVCIS)

![LVCIS Screenshot](https://github.com/rshdgvn/LV-CIS/blob/main/client/public/Screenshot%202025-09-24%20231125.png?raw=true)

A **centralized platform** for managing student clubs at **La Verdad Christian College**.  
Designed to simplify **membership, events, attendance, and analytics** — all in one place.

---

## 🚀 Key Features

- **Role-based Access**
  - **Admin:** Manage clubs, events, users, and reports  
  - **Officers:** Organize events, assign tasks, track attendance  
  - **Members:** Join clubs, view events, check participation  

- **Events & Task Management**
  - Create events with multiple tasks  
  - Assign officers and track progress  

- **Attendance System**
  - Record attendance per event  
  - Generate attendance reports by member or event  

- **Membership System**
  - Manage club members (multi-club support)  
  - Track active/inactive memberships  

- **Dashboard & Analytics**
  - Insights on attendance, events, and member activity  
  - Visual reports for admins and officers  

---

## Installation Guide

### 1. Clone the Repository

```bash
git clone https://github.com/rshdgvn/LV-CIS.git
cd LV-CIS
```

## 2. Server Setup (Laravel)
```bash
cd server

# Install Dependencies
composer install

# Create environment file
cp .env.example .env

# Generate app key
php artisan key:generate

# Run Migrations & Seeders
php artisan migrate --seed

# Start the Laravel Server
php artisan serve
```

## 3. Client Setup (React)
```bash
cd ../client

# Install Dependencies
npm install

# Start the react app
npm run dev
```

