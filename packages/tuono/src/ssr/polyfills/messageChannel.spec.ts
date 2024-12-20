import { describe, it, expect } from 'vitest'
import { MessageChannelPolyfill, MessagePortPolyfill } from './messageChannel'

describe('MessagePortPolyfill', () => {
  it('should invoke onmessage when a message is posted', () => {
    const port = new MessagePortPolyfill()
    let messageReceived: string | null = null

    port.onmessage = (event) => {
      messageReceived = event.data
    }

    port.dispatchEvent({ data: 'Hello, world!' } as MessageEvent)
    expect(messageReceived).toBe('Hello, world!')
  })

  it('should handle multiple event listeners', () => {
    const port = new MessagePortPolyfill()
    const messages: string[] = []

    const listener1 = (event: MessageEvent) =>
      messages.push('Listener1: ' + event.data)
    const listener2 = (event: MessageEvent) =>
      messages.push('Listener2: ' + event.data)

    port.addEventListener('message', listener1)
    port.addEventListener('message', listener2)

    port.dispatchEvent({ data: 'Test message' } as MessageEvent)
    expect(messages).toEqual([
      'Listener1: Test message',
      'Listener2: Test message',
    ])
  })

  it('should not invoke removed event listeners', () => {
    const port = new MessagePortPolyfill()
    const messages: string[] = []

    const listener = (event: MessageEvent) => messages.push(event.data)

    port.addEventListener('message', listener)
    port.dispatchEvent({ data: 'First message' } as MessageEvent)

    port.removeEventListener('message', listener)
    port.dispatchEvent({ data: 'Second message' } as MessageEvent)

    expect(messages).toEqual(['First message'])
  })

  it('should not post messages if otherPort is null', () => {
    const port = new MessagePortPolyfill()
    let messageReceived: string | null = null

    port.onmessage = (event) => {
      messageReceived = event.data
    }

    port.postMessage('Hello!')
    expect(messageReceived).toBeNull()
  })
})

describe('MessageChannelPolyfill', () => {
  it('should send and receive messages between ports', () => {
    const channel = new MessageChannelPolyfill()
    const messages: string[] = []

    channel.port1.onmessage = (event) => {
      messages.push(event.data)
    }

    channel.port2.postMessage('Hello, port1!')
    channel.port2.postMessage('How are you?')

    expect(messages).toEqual(['Hello, port1!', 'How are you?'])
  })

  it('should support addEventListener and removeEventListener', () => {
    const channel = new MessageChannelPolyfill()
    const messages: string[] = []

    const listener = (event: MessageEvent) => {
      messages.push(event.data)
    }

    channel.port1.addEventListener('message', listener)
    channel.port2.postMessage('Hello, port1!')
    expect(messages).toEqual(['Hello, port1!'])

    channel.port1.removeEventListener('message', listener)
    channel.port2.postMessage('Message after removing listener')

    expect(messages).toEqual(['Hello, port1!'])
  })

  it('should handle bidirectional communication between ports', () => {
    const channel = new MessageChannelPolyfill()
    const messagesPort1: string[] = []
    const messagesPort2: string[] = []

    channel.port1.onmessage = (event) => {
      messagesPort1.push(event.data)
    }

    channel.port2.onmessage = (event) => {
      messagesPort2.push(event.data)
    }

    channel.port1.postMessage('Hello, port2!')
    channel.port2.postMessage('Hello, port1!')

    expect(messagesPort1).toEqual(['Hello, port1!'])
    expect(messagesPort2).toEqual(['Hello, port2!'])
  })
})
