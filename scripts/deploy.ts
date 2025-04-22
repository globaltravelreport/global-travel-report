import { execSync } from 'child_process'
import { sendDeploymentNotification } from '../utils/notifications'
import dotenv from 'dotenv'

dotenv.config()

async function deploy() {
  const environment = process.env.VERCEL_ENV || 'production'
  const version = process.env.npm_package_version
  const buildId = process.env.NEXT_PUBLIC_BUILD_ID
  const commitSha = execSync('git rev-parse HEAD').toString().trim()

  try {
    // Notify deployment start
    await sendDeploymentNotification({
      status: 'started',
      environment,
      version,
      buildId,
      commitSha
    })

    // Run build
    console.log('Building application...')
    execSync('npm run build', { stdio: 'inherit' })

    // Deploy to Vercel
    console.log('Deploying to Vercel...')
    execSync('vercel --prod', { stdio: 'inherit' })

    // Notify successful deployment
    await sendDeploymentNotification({
      status: 'success',
      environment,
      version,
      buildId,
      commitSha
    })

    console.log('Deployment completed successfully!')
  } catch (error) {
    // Notify deployment failure
    await sendDeploymentNotification({
      status: 'failed',
      environment,
      version,
      buildId,
      commitSha,
      error: error instanceof Error ? error.message : String(error)
    })

    console.error('Deployment failed:', error)
    process.exit(1)
  }
}

deploy().catch(console.error) 