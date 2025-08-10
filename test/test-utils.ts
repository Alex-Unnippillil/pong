import type { IncomingMessage, ServerResponse } from 'http'

export function createServerFromHandler(
  handler: (req?: Request) => Promise<Response> | Response,
) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', async () => {
      const body = Buffer.concat(chunks).toString()
      let response: Response
      if (handler.length === 0) {
        response = await handler()
      } else {
        const request = new Request(`http://localhost${req.url}`, {
          method: req.method,
          headers: req.headers as any,
          body: body || undefined,
        })
        response = await handler(request)
      }
      res.statusCode = response.status
      response.headers.forEach((value, key) => res.setHeader(key, value))
      const text = await response.text()
      res.end(text)
    })
  }
}
