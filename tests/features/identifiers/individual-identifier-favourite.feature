Feature: IndividualIdentifierFavourite

  Scenario: C154 IndividualIdentifierFavourite - Chose favourite identifier
    Given user is onboarded with skipped password creation
    And user skip UNDP flavor application if it exist
    And identifier is created and user can see Identifier Card Details screen for Individual
    And user tap Favourite button on Identifier Card Details screen
    When tap Done button on Identifier Card Details screen
    Then user can see chosen identifier as his favourite on Identifiers screen
