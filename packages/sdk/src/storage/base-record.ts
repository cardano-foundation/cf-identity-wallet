import { JsonObject, JsonProperty } from 'json2typescript';

@JsonObject("BaseRecord")
abstract class BaseRecord {
  @JsonProperty("id", String)
  id: string = "";

  @JsonProperty("repositoryId", String)
  repositoryId: string = "";
}

export {
  BaseRecord
}
