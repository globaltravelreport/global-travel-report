import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { exec } from 'child_process'
import { promisify } from 'util'
import { logger } from '@/app/utils/logger'

const execAsync = promisify(exec)

// Verify the request is authorized
function isAuthorized(): boolean {
  const headersList = headers()
  const authToken = headersList.get('authorization')?.split(' ')[1]
  
  if (!process.env.PUBLISH_SECRET_TOKEN) {
    logger.error('PUBLISH_SECRET_TOKEN is not set in environment variables');
    return false;
  }
  
  return authToken === process.env.PUBLISH_SECRET_TOKEN
}

export async function POST(_request: Request) {
  try {
    // Check authorization
    if (!isAuthorized()) {
      logger.warn('Unauthorized publish attempt');
      return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Execute the publishing script
    const scriptPath = 'scripts/publish.sh'
    
    // Verify script exists
    try {
      await execAsync(`test -f ${scriptPath}`)
    } catch (error) {
      logger.error('Publishing script not found', { scriptPath });
      return NextResponse.json({
        success: false,
        error: 'Publishing script not found',
      }, { status: 500 })
    }

    // Execute script
    const { stdout, stderr } = await execAsync(`bash ${scriptPath}`)

    // Log the output
    if (stdout) logger.info('Publishing script output', { stdout });
    if (stderr) logger.warn('Publishing script warnings', { stderr });

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
    logger.error('Error in publishing process', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to execute publishing process',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// Only allow POST requests
export async function GET() {
  try {
    // Your publishing logic here
    return NextResponse.json({ success: true });
  } catch (err) {
    logger.error('Failed to run daily publish:', err);
    return NextResponse.json(
      { error: 'Failed to run daily publish' },
      { status: 500 }
    );
  }
} 