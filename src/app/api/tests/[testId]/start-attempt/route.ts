import { getPayloadClient } from '../../../../../payload'
import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '../../../../../lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: { testId: string } }
) {
  // Always properly await dynamic route params
  const resolvedParams = await Promise.resolve(params);
  const testId = resolvedParams.testId;



  try {
    // Initialize payload client
    const payload = await getPayloadClient();


    // Get the current user
    const user = await getCurrentUser();

    if (!user) {
      console.error('No authenticated user found');
      return NextResponse.json(
        { error: 'Unauthorized - Please log in to start a test' },
        { status: 401 }
      );
    }



    if (user.role !== 'student') {
      console.error('User is not a student');
      return NextResponse.json(
        { error: 'Only students can start test attempts' },
        { status: 403 }
      );
    }

    // Fetch the test
    let test;
    try {
      test = await payload.findByID({
        collection: 'tests',
        id: testId,
        depth: 2,
      });

    } catch (error) {
      console.error('Error fetching test:', error);
      return NextResponse.json(
        { error: `Test not found: ${error.message}` },
        { status: 404 }
      );
    }

    // Verify test has assignments array
    if (!test.assignments || !Array.isArray(test.assignments)) {
      console.error('Test has no assignments array');
      return NextResponse.json(
        { error: 'Test has no assignments' },
        { status: 400 }
      );
    }



    // Find the assignment for this student
    const assignment = test.assignments.find((a) => {
      const studentId = typeof a.student === 'object' ? a.student.id : a.student;
      return String(studentId) === String(user.id);
    });

    if (!assignment) {
      console.error('Test not assigned to user:', user.id);
      return NextResponse.json(
        { error: 'This test is not assigned to you' },
        { status: 403 }
      );
    }



    // Check if the assignment is already completed
    if (assignment.status === 'completed') {
      console.error('Test already completed');
      return NextResponse.json(
        { error: 'This test has already been completed' },
        { status: 400 }
      );
    }

    // Check if the due date has passed
    if (new Date(assignment.dueDate) < new Date()) {
      console.error('Due date passed');
      return NextResponse.json(
        { error: 'The due date for this test has passed' },
        { status: 400 }
      );
    }

    // Fetch existing attempts
    let attempts;
    try {
      const result = await payload.find({
        collection: 'test-attempts',
        where: {
          and: [
            {
              'test': {
                equals: testId,
              },
            },
            {
              'student': {
                equals: user.id,
              },
            },
          ],
        },
      });
      attempts = result.docs;

    } catch (error) {
      console.error('Error fetching attempts:', error);
      attempts = [];
    }

    const completedAttempts = attempts.filter(attempt => attempt.status === 'completed');
    const inProgressAttempt = attempts.find(attempt => attempt.status === 'in_progress');



    // Also check logs collection for completed attempts
    let totalCompletedAttempts = completedAttempts.length;
    try {
      const logsResult = await payload.find({
        collection: 'logs',
        where: {
          and: [
            {
              'action': {
                equals: 'submit-mock-attempt',
              },
            },
            {
              'value.testId': {
                equals: testId,
              },
            },
            {
              'user': {
                equals: user.id,
              },
            },
          ],
        },
      });

      const loggedAttempts = logsResult.docs;


      // Add the logged attempts to our count
      totalCompletedAttempts += loggedAttempts.length;

    } catch (error) {
      console.error('Error fetching logged attempts:', error);
      // Continue with the existing count if we can't check logs
    }

    // Check if there's already an attempt in progress
    if (inProgressAttempt) {
      return NextResponse.redirect(
        new URL(`/tests/${testId}/attempt/${inProgressAttempt.id}`, req.url)
      );
    }

    // Check if the student has reached the attempt limit (using both test-attempts and logs)
    if (totalCompletedAttempts >= test.attemptLimit) {
      console.error('Attempt limit reached (including logged attempts)');
      return NextResponse.json(
        { error: 'You have reached the maximum number of attempts for this test' },
        { status: 400 }
      );
    }

    // Create a mock attempt as the primary solution


    // Generate a random ID for the mock attempt
    const mockAttemptId = Math.floor(Math.random() * 1000000);

    // Update assignment status
    if (assignment.status === 'pending') {
      const assignmentIndex = test.assignments.findIndex(a => a.id === assignment.id);

      if (assignmentIndex !== -1) {
        test.assignments[assignmentIndex].status = 'in_progress';

        try {
          await payload.update({
            collection: 'tests',
            id: test.id,
            data: {
              assignments: test.assignments,
            },
          });
        } catch (error) {
          console.error('Error updating assignment status:', error);
          // Continue anyway since we're using a mock attempt
        }
      }
    }

    // Log the attempt start in the logs collection
    try {
      await payload.create({
        collection: 'logs',
        data: {
          action: 'start-mock-attempt',
          timestamp: new Date().toUTCString(),
          user: user.id,
          value: {
            testId: test.id,
            testName: test.title,
            attemptId: mockAttemptId.toString(),
            studentId: user.id.toString(),
          },
        },
      });

    } catch (logError) {
      console.error('Error logging attempt start:', logError);
      // Continue even if logging fails
    }

    // Redirect to the mock attempt page

    return NextResponse.redirect(
      new URL(`/tests/${testId}/mock-attempt/${mockAttemptId}?testId=${testId}&studentId=${user.id}&assignmentId=${assignment.id}`, req.url)
    );

  } catch (error) {
    console.error('Unexpected error in test attempt creation:', error);
    return NextResponse.json({
      error: `An unexpected error occurred: ${error.message}`
    }, { status: 500 });
  }
} 