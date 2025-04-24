import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

// Verify the request is authorized
function isAuthorized(request: Request): boolean {
  const headersList = headers()
  const authToken = headersList.get('authorization')?.split(' ')[1]
  return authToken === process.env.PUBLISH_SECRET_TOKEN
}

export async function POST(request: Request) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Execute the publishing script
    const scriptPath = 'scripts/publish.sh'
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`)

    // Log the output
    console.log('Publishing script output:', stdout)
    if (stderr) console.error('Publishing script errors:', stderr)

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Publishing process completed successfully',
      details: {
        stdout,
        stderr: stderr || null,
      }
    })

  } catch (error) {
    console.error('Error in publishing process:', error)
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute publishing process',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Only allow POST requests
export async function GET() {
  return new NextResponse(JSON.stringify({ error: 'Method not allowed' }), {
    status: 405,
    headers: { 'Content-Type': 'application/json' },
  })
} 