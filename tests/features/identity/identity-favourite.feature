Feature: Identity Favourite

  Background:
    Given user is onboarded with skipped password creation
    And identifier is created and user can see Card Details screen for KERI

  Scenario: Identity Favourite - Chose favourite identity
    Given user tap Favourite button on Card Details screen
    When tap Done button on Card Details screen
    Then user can see chosen identity as his favourite on Identity screen
