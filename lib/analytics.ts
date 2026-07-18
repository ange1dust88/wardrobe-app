import posthog from 'posthog-js'

const KEY = process.env.NEXT_PUBLIC_POSTHOG_KEY
const HOST = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? 'https://us.i.posthog.com'

let started = false

export function initAnalytics() {
  if (started || !KEY || typeof window === 'undefined') return
  started = true
  posthog.init(KEY, {
    api_host: HOST,
    capture_pageview: false,
    capture_pageleave: true,
    person_profiles: 'identified_only',
  })
}

export function capture(event: string, props?: Record<string, unknown>) {
  if (!started) return
  posthog.capture(event, props)
}

export function capturePageview(path: string) {
  if (!started) return
  posthog.capture('$pageview', {
    $current_url: window.location.href,
    path,
  })
}

export function identifyUser(id: string, props?: Record<string, unknown>) {
  if (!started) return
  posthog.identify(id, props)
}

export function resetAnalytics() {
  if (!started) return
  posthog.reset()
}
