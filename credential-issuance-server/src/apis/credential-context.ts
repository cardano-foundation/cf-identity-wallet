import { Request, Response } from "express";

function summitAccessPass(_: Request, res: Response) {
  const context = {
    "@context": {
      "@version": 1.1,
      "@protected": true,
      "name": "http://schema.org/name",
      "description": "http://schema.org/description",
      "identifier": "http://schema.org/identifier",
      "image": {"@id": "http://schema.org/image", "@type": "@id"},
      "AccessPassCredential": {
        "@id": "http://schema.org/summit#AccessPassCredential",
        "@context": {
          "@version": 1.1,
          "@protected": true,
          "id": "@id",
          "type": "@type",
          "description": "http://schema.org/description",
          "name": "http://schema.org/name",
          "identifier": "http://schema.org/identifier",
          "image": {"@id": "http://schema.org/image", "@type": "@id"}
        }
      },
      "AccessPass": {
        "@id": "http://schema.org/summit#AccessPass",
        "@context": {
          "@version": 1.1,
          "@protected": true,
          "id": "@id",
          "type": "@type",
          "schema": "http://schema.org/",
          "xsd": "http://www.w3.org/2001/XMLSchema#",
          "eventName": "http://schema.org/event",
          "passId": "schema:passId",
          "name": "schema:name",
          "startDate": "schema:startDate",
          "endDate": "schema:endDate",
          "location": "schema:location"
        }
      },

      "Person": "http://schema.org/Person"
    }
  };
  res.json(context).status(200);
}

export { summitAccessPass };
