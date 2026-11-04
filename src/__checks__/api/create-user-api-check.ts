import { ApiCheck, AssertionBuilder, CheckGroupV2 } from 'checkly/constructs'

export interface User {
  id: number
  name: string
  profile_url: string
}

/**
 * Creates one API Check for a user profile URL.
 *
 * Asserts that the endpoint returns 200 and that the `id` and `name`
 * in the response match the values from users.json.
 *
 * The bearer token is never stored in code: `{{USERS_API_TOKEN}}` is resolved by
 * Checkly at run time from a secret environment variable.
 */
export function createUserApiCheck(user: User, group: CheckGroupV2): ApiCheck {
  return new ApiCheck(`user-profile-${user.id}`, {
    name: `User profile: ${user.name} (${user.id})`,
    group,
    degradedResponseTime: 3000,
    maxResponseTime: 10000,
    request: {
      method: 'GET',
      url: user.profile_url,
      headers: [{ key: 'Authorization', value: 'Bearer {{USERS_API_TOKEN}}' }],
      assertions: [
        AssertionBuilder.statusCode().equals(200),
        AssertionBuilder.jsonBody('$.id').equals(user.id),
        AssertionBuilder.jsonBody('$.name').equals(user.name),
      ],
    },
  })
}
