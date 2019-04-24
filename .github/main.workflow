workflow "On Release New Version" {
  on = "release"
  resolves = ["sentry.io"]
}

action "sentry.io" {
  uses = "juankaram/sentry-release@v1.0.0"
  secrets = ["SENTRY_AUTH_TOKEN"]
  env = {
    ENVIRONMENT = "production"
    SENTRY_PROJECT = "yuna"
    SENTRY_ORG = "yuna"
  }
}
