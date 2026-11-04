import { EmailAlertChannel } from 'checkly/constructs'

// Defines the settings for our alert channels. 
// Note that you can create multiple channels of a type:
// e.g. "prodEmailChannel" "frontendTeamEmailChannel" etc.
// See all the options at https://www.checklyhq.com/docs/alerting-and-retries/alert-channels/


const sendDefaults = {
  sendFailure: true,
  sendRecovery: true,
  sendDegraded: false,
  sslExpiry: true,
  sslExpiryThreshold: 30
}

export const emailChannel = new EmailAlertChannel('email-channel-1', {
  address: 'alerts@acme.com',
  ...sendDefaults
})
