<img src="https://raw.githubusercontent.com/dnl-fm/gotrequests.com/master/gotrequests.webp?sanitize=true" alt="gotrequests logo" width="250" align="right" style="max-width: 40vw;">

# gotrequests?

_A utility designed to assist developers in logging and evaluating incoming HTTP
requests from various sources._

Key features:

- record incoming http requests
- see all recorded requests
- refresh if needed
- one day cache

Possible use cases:

- validate messages coming back from message queues

## Introduction

Each request must include a session-id, which can be specified either as a
subdomain or as part of the pathname.

There are three distinct types of requests available: one for capturing any
incoming request, another for viewing the logs of all incoming requests, and a
third for refreshing your session cache.

The logs are accessible for a duration of one day.

## Request types

### Record

This type will record any incoming request and add it to your daily session
cache.

Send any request to: `https://your-session-id.gotrequests.com`

Example URL: `https://emails.gotrequests.com`

### Logs

This type will list all items of your recorded requests for your daily session
cache.

Send any request to: `https://gotrequests.com/logs/your-session-id`

Example URL: `https://gotrequests.com/logs/emails`

### Refresh

Want to empty your session cache? Simply refresh it.

Send any request to: `https://gotrequests.com/refresh/your-session-id`

Example URL: `https://gotrequests.com/refresh/emails`

## License

gotrequests.com is free software, and is released under the terms of the
[Mozilla Public License](https://www.mozilla.org/en-US/MPL/) version 2.0. See
[LICENSE](LICENSE).
