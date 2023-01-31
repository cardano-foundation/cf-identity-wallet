export function statusBody() {
    return ` 
    query cardanoDbMeta  {
        cardanoDbMeta {
          initialized
          syncPercentage
        } 
    }
  `
}
