import { createAgent, IResolver, ICredentialPlugin } from '@veramo/core'
import { CredentialPlugin } from '@veramo/credential-w3c'
import { DIDResolverPlugin, getUniversalResolverFor } from '@veramo/did-resolver'
import { Resolver } from 'did-resolver'

// Universal Resolver URL
const UNIVERSAL_RESOLVER_URL = 'http://localhost:8080/1.0/identifiers/'

const methods = ['ethr', 'web']

// const universalResolver = getUniversalResolverFor(methods, UNIVERSAL_RESOLVER_URL)
const universalResolver = getUniversalResolverFor(methods, 'https://uniresolver.io/1.0/identifiers/')

export const verifierAgent = createAgent<IResolver & ICredentialPlugin>({
  plugins: [
    new DIDResolverPlugin({
      resolver: new Resolver({
        ...universalResolver
      }),
    }),
    new CredentialPlugin(),
  ],
})