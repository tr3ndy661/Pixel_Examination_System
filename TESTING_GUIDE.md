# Testing Guide for English Examination System

This guide provides detailed instructions for testing the various functionalities of the English Examination System. It covers both manual testing procedures and automated testing approaches.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Setting Up the Test Environment](#setting-up-the-test-environment)
3. [Admin Panel Testing](#admin-panel-testing)
4. [Student Panel Testing](#student-panel-testing)
5. [API Testing](#api-testing)
6. [Common Issues and Troubleshooting](#common-issues-and-troubleshooting)
7. [Regression Testing Checklist](#regression-testing-checklist)

## Prerequisites

Before beginning testing, ensure you have:

- A running instance of the English Examination System
- Admin user credentials
- Student user credentials (at least one for each level 1-9)
- Test browser environments (Chrome, Firefox, Safari)
- Access to the database for verification if needed

## Setting Up the Test Environment

1. Start the development server:

   ```bash
   npm run dev
   ```

2. Prepare test data:
   - Create at least one course per level
   - Create tests with various question types
   - Create student accounts for different levels
   - Set up test assignments with different due dates

## Admin Panel Testing

### User Management

**Create Admin User**

- Steps:
  - Log in as admin
  - Navigate to Users collection
  - Create new user with admin role
- Expected Result: New admin user is created and can log in

**Create Student User**

- Steps:
  - Log in as admin
  - Navigate to Users collection
  - Create new user with student role and assigned level
- Expected Result: New student user is created and can log in

**Edit User**

- Steps:
  - Log in as admin
  - Navigate to Users collection
  - Edit an existing user
- Expected Result: User details are updated successfully

**Delete User**

- Steps:
  - Log in as admin
  - Navigate to Users collection
  - Delete a user
- Expected Result: User is removed from the system

### Course Management

**Create Course**

- Steps:
  - Log in as admin
  - Navigate to Courses collection
  - Create new course
- Expected Result: New course is created and visible in the list

**Assign Level to Course**

- Steps:
  - Log in as admin
  - Edit a course
  - Assign a level (1-9)
- Expected Result: Course is associated with the specified level

**Edit Course**

- Steps:
  - Log in as admin
  - Navigate to Courses collection
  - Edit an existing course
- Expected Result: Course details are updated successfully

**Delete Course**

- Steps:
  - Log in as admin
  - Navigate to Courses collection
  - Delete a course
- Expected Result: Course is removed from the system

### Test Management

**Create Test**

- Steps:
  - Log in as admin
  - Navigate to Tests collection
  - Create new test with title, description, time limit
- Expected Result: New test is created and visible in the list

**Add Questions to Test**

- Steps:
  - Edit a test
  - Add multiple-choice questions
  - Add fill-in-the-blank questions
- Expected Result: Questions are added to the test

**Add Attachments to Test**

- Steps:
  - Edit a test
  - Upload PDF attachment
  - Upload audio attachment
- Expected Result: Attachments are added to the test

**Set Attempt Limit**

- Steps:
  - Edit a test
  - Set attempt limit to 2
- Expected Result: Test is configured with 2 maximum attempts

**Assign Test to Students**

- Steps:
  - Edit a test
  - Add student assignments with due dates
- Expected Result: Test is assigned to selected students

### Question Management

**Create Multiple-Choice Question**

- Steps:
  - Navigate to Questions collection
  - Create new multiple-choice question
  - Add options and mark correct answer
- Expected Result: Question is created with options and correct answer

**Create Fill-in-the-Blank Question**

- Steps:
  - Navigate to Questions collection
  - Create new fill-in-the-blank question
  - Specify correct answer
- Expected Result: Question is created with correct answer

**Edit Question**

- Steps:
  - Navigate to Questions collection
  - Edit an existing question
- Expected Result: Question details are updated successfully


**Delete Question**

- Steps:
  - Navigate to Questions collection
  - Delete a question
- Expected Result: Question is removed from the system

## Student Panel Testing

### Authentication

**Student Login**

- Steps:
  - Visit login page
  - Enter student credentials
  - Submit login form
- Expected Result: Student is logged in and redirected to dashboard

**Invalid Login**

- Steps:
  - Visit login page
  - Enter incorrect credentials
  - Submit login form
- Expected Result: Error message is displayed

**Session Expiry**

- Steps:
  - Log in as student
  - Wait for session to expire
  - Try to access protected page
- Expected Result: Redirected to login page with session expiry message

**Logout**

- Steps:
  - Log in as student
  - Click logout button
- Expected Result: Student is logged out and redirected to login page

### Dashboard

**View Assigned Tests**

- Steps:
  - Log in as student
  - Navigate to dashboard
- Expected Result: Assigned tests are displayed with status

**Filter Tests by Status**

- Steps:
  - View dashboard
  - Use status filters
- Expected Result: Tests are filtered according to selection

**View Test Details**

- Steps:
  - View dashboard
  - Click on a test
- Expected Result: Test details page is displayed

### Test Taking

**Start Test**

- Steps:
  - View test details
  - Click "Start Test" button
- Expected Result: Test attempt is created and student is redirected to test page

**Attempt Counter**

- Steps:
  - Complete a test
  - Return to test details
  - Verify attempts counter
- Expected Result: Attempts counter shows 1 of X attempts used

**Maximum Attempts**

- Steps:
  - Use all available attempts
  - Try to start another attempt
- Expected Result: "Maximum attempts reached" message is displayed

**View Attachments**

- Steps:
  - Start test with attachments
  - Click on PDF attachment
- Expected Result: PDF opens in new tab

**Play Audio**

- Steps:
  - Start test with audio attachment
  - Click play button
- Expected Result: Audio plays correctly

**Answer Multiple-Choice**

- Steps:
  - Start test
  - Select answer for multiple-choice question
- Expected Result: Selection is saved

**Answer Fill-in-the-Blank**

- Steps:
  - Start test
  - Enter text in fill-in-the-blank field
- Expected Result: Text is saved

**Test Timer**

- Steps:
  - Start test with time limit
  - Observe timer
- Expected Result: Timer counts down correctly

**Time Expiry**

- Steps:
  - Start test
  - Let timer expire
- Expected Result: Test is automatically submitted

**Submit Test**

- Steps:
  - Answer all questions
  - Click submit button
  - Confirm submission
- Expected Result: Test is submitted and results are displayed

### Results Viewing

**View Test Results**

- Steps:
  - Complete a test
  - Navigate to results page
- Expected Result: Test results are displayed

**View Detailed Results**

- Steps:
  - Navigate to results page
  - Click on a result
- Expected Result: Detailed breakdown of answers and scores is displayed

**View Correct Answers**

- Steps:
  - View detailed results
  - Check correct answers section
- Expected Result: Correct answers are displayed for each question

**View Chosen Answers**

- Steps:
  - View detailed results
  - Check your answers section
- Expected Result: Student's chosen answers are displayed

### Profile Management

**View Profile**

- Steps:
  - Log in as student
  - Navigate to profile page
- Expected Result: Profile information is displayed

**Update Profile**

- Steps:
  - Navigate to profile page
  - Edit name
  - Submit form
- Expected Result: Profile is updated with success message

**Change Password**

- Steps:
  - Navigate to profile page
  - Enter new password
  - Confirm new password
  - Submit form
- Expected Result: Password is updated with success message

**Password Mismatch**

- Steps:
  - Navigate to profile page
  - Enter different passwords in password and confirm fields
  - Submit form
- Expected Result: Error message about password mismatch is displayed

## API Testing

You can test the API endpoints using tools like Postman or curl:

### Authentication Endpoints

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}'

# Get current user
curl -X GET http://localhost:3000/api/users/me \
  -H "Cookie: payload-token=YOUR_TOKEN"

# Logout
curl -X POST http://localhost:3000/api/auth/logout
```

### Test Attempt Endpoints

```bash
# Start test attempt
curl -X POST http://localhost:3000/api/tests/TEST_ID/start-attempt \
  -H "Cookie: payload-token=YOUR_TOKEN"

# Submit response
curl -X POST http://localhost:3000/api/tests/TEST_ID/attempt/ATTEMPT_ID/response \
  -H "Content-Type: application/json" \
  -H "Cookie: payload-token=YOUR_TOKEN" \
  -d '{"questionId":"QUESTION_ID","response":"ANSWER"}'

# Submit test
curl -X POST http://localhost:3000/api/tests/TEST_ID/attempt/ATTEMPT_ID/submit \
  -H "Cookie: payload-token=YOUR_TOKEN"
```

## Common Issues and Troubleshooting

### Authentication Issues

- **Session Expiry**: If you're getting redirected to login unexpectedly, your session may have expired. Try logging in again.
- **Cookie Issues**: Ensure cookies are enabled in your browser.
- **CORS Issues**: When testing APIs from external tools, you may encounter CORS issues. Use appropriate headers or test from the same origin.

### Test Taking Issues

- **Timer Issues**: If the timer isn't working correctly, check your browser console for errors.
- **Submission Failures**: If test submission fails, check network requests in browser dev tools for error responses.
- **Attachment Display Problems**: If attachments aren't displaying, verify the file exists and the media API is working correctly.

### Database Issues

- **Missing Data**: If data appears to be missing, check database connections and queries.
- **Slow Performance**: If the system is slow, check database indexes and query performance.

## Regression Testing Checklist

Before each release, perform these tests to ensure existing functionality hasn't been broken:

- [ ] User authentication (login/logout)
- [ ] Admin can create and manage users
- [ ] Admin can create and manage courses
- [ ] Admin can create and manage tests with questions
- [ ] Admin can assign tests to students
- [ ] Students can view assigned tests
- [ ] Students can take tests within the attempt limit
- [ ] Test timer functions correctly
- [ ] Multiple-choice questions can be answered
- [ ] Fill-in-the-blank questions can be answered
- [ ] Attachments (PDF and audio) can be accessed
- [ ] Test results are calculated correctly
- [ ] Students can view their test results
- [ ] Profile information can be updated

## Automated Testing

For future development, consider implementing automated tests:

1. **Unit Tests**: Test individual functions and components
2. **Integration Tests**: Test API endpoints and database interactions
3. **End-to-End Tests**: Test complete user flows using tools like Cypress or Playwright

Example Cypress test for login:

```javascript
describe('Login', () => {
  it('should login with valid credentials', () => {
    cy.visit('/login')
    cy.get('#email-address').type('student@example.com')
    cy.get('#password').type('password123')
    cy.get('form').submit()
    cy.url().should('include', '/dashboard')
  })

  it('should show error with invalid credentials', () => {
    cy.visit('/login')
    cy.get('#email-address').type('wrong@example.com')
    cy.get('#password').type('wrongpassword')
    cy.get('form').submit()
    cy.contains('Login Error').should('be.visible')
  })
})
```

things to fix:

-fix the delete question as currently its not working
-fix the stopping user from continuing the test as after the timer runs out the user can still continue the test
-fix the attachements as currently the audio is not playing and the pdf when redirected shows the api calls
-remove the currently in progress tests from the dashboard