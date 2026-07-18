export class HttpError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, message)
}

export function notFound(message: string): HttpError {
  return new HttpError(404, message)
}

export function jsonError(err: unknown): Response {
  if (err instanceof HttpError) {
    return Response.json({ message: err.message }, { status: err.status })
  }
  console.error(err)
  return Response.json({ message: 'Internal server error' }, { status: 500 })
}

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn()
  } catch (err) {
    return jsonError(err)
  }
}
