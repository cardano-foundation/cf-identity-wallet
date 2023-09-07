import {AgentContext, AriesFrameworkError, DidResolverService, DocumentLoader} from "@aries-framework/core";
import jsonld from "@aries-framework/core/build/modules/vc/libraries/jsonld";
import {getNativeDocumentLoader} from "@aries-framework/core/build/modules/vc/libraries/nativeDocumentLoader.native";
export function isDid(potentialDid: string) {
  return potentialDid.startsWith("did:")
}
export function documentLoader(agentContext: AgentContext): DocumentLoader {
  const didResolver = agentContext.dependencyManager.resolve(DidResolverService)
  async function loader(url: string) {
    if (isDid(url)) {
      const result = await didResolver.resolve(agentContext, url)
      if (result.didResolutionMetadata.error || !result.didDocument) {
        throw new AriesFrameworkError(`Unable to resolve DID: ${url}`)
      }
      const framed = await jsonld.frame(
        result.didDocument.toJSON(),
        {
          "@context": result.didDocument.context,
          "@embed": "@never",
          id: url,
        },
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        { documentLoader: this }
      )
      return {
        contextUrl: null,
        documentUrl: url,
        document: framed,
      }
    }
    const platformLoader = getNativeDocumentLoader()
    const nativeLoader = platformLoader.apply(jsonld, [])
    return await nativeLoader(url)
  }

  return loader.bind(loader)
}
