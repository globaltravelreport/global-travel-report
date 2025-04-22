import axios from 'axios'

interface DeploymentNotification {
  status: 'started' | 'success' | 'failed'
  environment: string
  version?: string
  buildId?: string
  commitSha?: string
  error?: string
}

export async function sendDeploymentNotification(notification: DeploymentNotification) {
  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL
  if (!slackWebhookUrl) {
    console.warn('Slack webhook URL not configured, skipping deployment notification')
    return
  }

  const emoji = {
    started: '🚀',
    success: '✅',
    failed: '❌'
  }[notification.status]

  const message = {
    blocks: [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `${emoji} *Deployment ${notification.status.toUpperCase()}*\nEnvironment: ${notification.environment}`
        }
      },
      {
        type: 'section',
        fields: [
          {
            type: 'mrkdwn',
            text: `*Version:*\n${notification.version || 'N/A'}`
          },
          {
            type: 'mrkdwn',
            text: `*Build ID:*\n${notification.buildId || 'N/A'}`
          },
          {
            type: 'mrkdwn',
            text: `*Commit:*\n${notification.commitSha ? notification.commitSha.substring(0, 7) : 'N/A'}`
          }
        ]
      }
    ]
  }

  if (notification.error) {
    message.blocks.push({
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*Error:*\n\`\`\`${notification.error}\`\`\``
      }
    })
  }

  try {
    await axios.post(slackWebhookUrl, message)
  } catch (error) {
    console.error('Failed to send Slack notification:', error)
  }
} 