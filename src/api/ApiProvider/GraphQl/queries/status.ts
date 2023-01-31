export function statusBody() {
    return ` 
    query statusBody  {
        cardanoDbMeta {
          initialized
          syncPercentage
        } 
    }
  `
}
