import { EventEmitter } from 'events'

const emitters = new Map<string, EventEmitter>()

function getEmitter(id: string) {
  let emitter = emitters.get(id)
  if (!emitter) {
    emitter = new EventEmitter()
    emitters.set(id, emitter)
  }
  return emitter
}

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const emitter = getEmitter(params.id)
  const encoder = new TextEncoder()

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      const onUpdate = (state: unknown) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(state)}\n\n`))
      }
      emitter.on('update', onUpdate)
      return () => {
        emitter.off('update', onUpdate)
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}

export async function POST(
  req: Request,
  { params }: { params: { id: string } },
) {
  const emitter = getEmitter(params.id)
  const body = await req.json()
  emitter.emit('update', body)
  return new Response(null, { status: 204 })
}

export const dynamic = 'force-dynamic'
