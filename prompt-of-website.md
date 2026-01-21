
## Project Overview

Hi.
We need to build a **corporate learning portal** for company employees.

All courses are **free**, so **no payment system is required**.

The platform must allow employees to log in, view available courses, complete them, and receive certificates upon completion. Administrators must be able to manage courses, users, and view learning statistics.
* **Multilingual Support**: The portal must support **English, Russian, and Kazakh** languages with a dynamic language switcher in the header.


---

## Authentication & Access

* **No public registration**
* Access is granted only via a **CSV file(users.csv)** that I will provide
* The CSV file contains:

  * usernames
  * passwords
  * user roles (employee or administrator)

Both **employees and administrators** will authenticate using credentials from this CSV file.

---

## Roles & Permissions

### Employee Role

Employees can:

* Log in using credentials from the CSV file
* View a list of available courses
* Enroll in and complete courses
* Pass course tests
* **Custom Certificate Name**: After passing a test, the employee must be able to enter a custom full name to be displayed on the generated certificate.
* Automatically receive a certificate after course completion
* **Course Retake**: Ability to retake a course multiple times (to allow different people to use the same account and get their own certificates). Every completion should generate a new certificate.

* View their personal learning statistics
* Edit their profile:

  * first name
  * last name
  * email

---

### Administrator Role

Administrators can:

* Log in using credentials from the CSV file
* Create new courses with:

  * title
  * description
  * content
  * tests
* Edit existing courses
* Delete courses
* View overall course completion statistics for all employees
* Manage users:

  * view list of employees
  * change user roles
* Edit their own profile:

  * first name
  * last name
  * email

---

## Course Structure

Each course must include:

* Course title
* Course description
* Course content:

  * text
  * images
  * videos (YouTube and Vimeo only)
  * documents (PDF, Word, etc., via external links like Google Drive)
* Knowledge tests:

  * multiple-choice questions
* Automatically generated certificate after completion
* Ability to upload an image for the course card (thumbnail)

---

## Certificates

* Certificates are generated automatically upon successful course completion
* **Recipient Name**: The certificate must use a name provided by the user upon completion, falling back to their account name if not specified.
* Certificates must be **automatically deleted 1 month after issuance**


  * This is required to free up server storage

---

## Design & UI Requirements

* Logo file is located in the same folder as the project

  * File name: `LOGO.jpeg`
  * The logo must be stored on the site and displayed in the header
* Color palette:

  * Buttons and headings: **green** `#5cad2d`
  * Background: **white** `#fffeff`
  * Text: **black** `#000000`
* Design style:

  * modern
  * minimalist
  * user-friendly
* **Responsive layout is mandatory**, including mobile devices

---

## Security & Quality Requirements

* The site must be:

  * secure
  * performant
  * scalable
  * easy to use
* Authentication must use:

  * JWT **or**
  * session-based authentication

---

## Technology Stack

* **Frontend:** your choice
* **Backend:** Python

  * Django **or** Flask
* **Database:** PostgreSQL
* **Authentication:** JWT or sessions

---

## What You Must Deliver

1. **Save and use the logo** (`LOGO.jpeg`) in the website header
2. **Create a Markdown file** that describes:

   * site structure
   * main pages
   * technologies used
   * system architecture
   * how everything works together
4. Implement **automatic certificate deletion after 1 month**
5. Create the **site structure and main pages**
6. **Docker Deployment**: Provide Docker configuration and instructions for hosting.

---

## Final Goal

Build a **secure, modern, responsive corporate learning portal** with role-based access, course management, testing, certification, and clear documentation.

---

If you want, I can next:

* Design the **site architecture**
* Define **database schema**
* Create **API endpoints**
* Generate **Django/Flask project structure**
* Write the **Markdown documentation files**
* Design **wireframes or UI layout**