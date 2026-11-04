import { CheckGroupV2, RetryStrategyBuilder } from 'checkly/constructs'
import { emailChannel } from '../utils/alert-channels'
import { createUserApiCheck, User } from './create-user-api-check'
import data from './users.json'

/**
 * Group: one API Check per user in users.json.
 * Add, edit or remove a user in the JSON file and run `npx checkly deploy`.
 */
export const userApiGroup = new CheckGroupV2('user-api-checks-group', {
  name: 'User API Checks',
  tags: ['api'],
  alertChannels: [emailChannel],
  retryStrategy: RetryStrategyBuilder.linearStrategy({
    baseBackoffSeconds: 30,
    maxRetries: 1,
    sameRegion: false,
  }),
})

for (const user of data.users as User[]) {
  createUserApiCheck(user, userApiGroup)
}
